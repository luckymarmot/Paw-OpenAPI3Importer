import SwaggerParser from '@apidevtools/swagger-parser'
import { OpenAPIV3 } from 'openapi-types'
import {
  PawURL,
  EnvironmentManager,
  logger,
  group,
  jsonSchemaParser,
} from 'utils'
import Paw from 'types/paw.d'

const parserOptions: SwaggerParser.Options = {
  resolve: {
    file: false,
  },
  dereference: {
    circular: false, // Don't allow circular $refs
  },
}

export default class PawConverter {
  private readonly context: Paw.Context
  private readonly requestGroups: MapKeyedWithString<Paw.RequestGroup> = {}
  private readonly envManagers: MapKeyedWithString<EnvironmentManager> = {}
  private readonly parserOptions: SwaggerParser.Options = { ...parserOptions }

  public apiDocument: OpenAPIV3.Document
  public filename: string = ''
  public apiParser: SwaggerParser
  public groupedRequest: GroupedRequestType[] = []

  constructor(parser: SwaggerParser, name: string, ctx: Paw.Context) {
    this.context = ctx
    this.filename = name

    /**
     * the api document data/info can now be accessed from the parser.
     * @see {@link https://github.com/APIDevTools/swagger-parser/blob/master/docs/swagger-parser.md#api}
     */
    this.apiParser = parser

    // set or initialize the import's environment.
    this.setEnvironment()

    // set or initialize a group of requests.
    this.setRequestGroups()
  }

  /**
   * @method init
   * @summary
   * is a PawConverter method that initializes the preparation of the parsed
   * document that will be converted to a paw request.
   *
   * @returns {Object<OpenAPIV3.Document>}
   */
  public init(): OpenAPIV3.Document<{}> {
    this.groupedRequest
      .map(({ path, group }: GroupedRequestType): any =>
        this.createRequestMeta(path, group),
      )
      .flat()
      .filter((item) => item !== null)
      .map((item: any, order: number) => ({ ...item, order }))
      .forEach((item, index, arr) => this.createRequest(item, index, arr))
    return this.apiParser.api as OpenAPIV3.Document
  }

  /**
   * @method setEnvironment
   * @summary sets the environment for the current file being imported.
   * @returns {Object<EnvironmentManager>} EnvironmentManager class instance.
   */
  private setEnvironment(): EnvironmentManager {
    const document = this.apiParser.api
    const { title } = document.info
    if (!this.envManagers[title]) {
      this.envManagers[title] = new EnvironmentManager(this.context, title)
      return this.envManagers[title]
    }
    return this.envManagers[title]
  }

  /**
   * @method getEnviroment
   * @summary fetches the current environment set for the file being imported.
   * @returns {Object<EnvironmentManager>} EnvironmentManager class instance.
   */
  private getEnviroment(): EnvironmentManager {
    const document = this.apiParser.api
    const { title } = document.info
    return !this.envManagers[title]
      ? this.setEnvironment()
      : this.envManagers[title]
  }

  /**
   * @method setRequestGroups
   * @summary a method that groups the request on a top level.
   * @returns {Array<CreateRequestGroupType>}
   */
  private setRequestGroups(): MapKeyedWithString<Paw.RequestGroup> {
    const document = this.apiParser.api
    const { paths } = document

    const groups: CreateRequestGroupType[] = [...Object.keys(paths)]
      .map(group.mapToGroup)
      .filter((item: CreateRequestGroupType) => item !== null)
      .map(group.mapToCapitalize)
      .reduce(group.createGroup, [])

    groups.forEach((item: CreateRequestGroupType) => {
      this.requestGroups[item.group] = this.context.createRequestGroup(
        item.group,
      )
    })

    this.groupedRequest = groups
      .map((item: CreateRequestGroupType): GroupedRequestType[] =>
        [...item.paths].map((path) => ({ group: item.group, path })),
      )
      .flat()
    return this.requestGroups
  }

  /**
   * @method createRequestMeta
   * @summary
   * @param {String} path
   * @param {String} group
   * @returns {Object<any>}
   */
  private createRequestMeta(path: string, group: string): any {
    const document = this.apiParser.api as OpenAPIV3.Document
    const operation = document.paths[path] as OpenAPIV3.PathsObject

    const ctx = Object.entries(operation).map(([verb, value]) => {
      const requestContext = value as OpenAPIV3.OperationObject

      if (!requestContext || requestContext.deprecated) return null

      const method = verb.toUpperCase()
      const { summary, description } = requestContext
      let requestBody = null
      let responses = null
      let parameters = null
      let servers = null

      if (requestContext.requestBody) {
        requestBody = requestContext.requestBody
      }

      if (requestContext.parameters) {
        parameters = requestContext.parameters
      }

      if (requestContext.responses) {
        responses = requestContext.responses
      }

      if (requestContext.servers) {
        servers = requestContext.servers
      }

      return {
        path,
        group,
        method,
        summary,
        description,
        requestBody,
        parameters,
        responses,
        servers,
      } as any
    })

    return ctx
  }

  /**
   * @method createRequest
   * @summary
   *
   * @param {Object} item
   * @param {Number} index
   * @param {Array<any>} array
   */
  private createRequest(item: any, index?: number, array?: any[]): void {
    const document = this.apiParser.api as OpenAPIV3.Document
    const { title } = document.info
    const request = this.context.createRequest(
      item.summary || item.path,
      item.method,
      new DynamicString(),
      item.description,
    )

    const requestURL = new PawURL(
      document.paths[item.path] as OpenAPIV3.PathItemObject,
      document,
      item.path,
      this.envManagers[title],
      request,
    )

    if (item.requestBody) {
      this.setRequesBody(
        request,
        item.requestBody as OpenAPIV3.RequestBodyObject,
      )
    }

    if (item.parameters) {
      logger.log(item.parameters)
    }

    request.url = requestURL.fullUrl

    this.requestGroups[item.group].appendChild(request)
  }

  /**
   * @method setRequesBody
   * @summary
   *
   * @param requestBody
   * @returns {Object<Paw.Request>}
   */
  private setRequesBody(
    request: Paw.Request,
    requestBody: OpenAPIV3.RequestBodyObject,
  ): Paw.Request {
    const mediaTypes = Object.keys(requestBody.content)

    if (mediaTypes.length === 0) return request

    const schema = requestBody.content[mediaTypes[0]]
      .schema as OpenAPIV3.SchemaObject

    request.body = JSON.stringify(jsonSchemaParser(schema, {}) as any, null, 2)
    request.setHeader('Content-Type', mediaTypes[0])

    return request
  }

  private setRequestParameters(
    request: Paw.Request,
    params: OpenAPIV3.ParameterObject[],
  ): Paw.Request {
    const p = params
      .filter((item) => !item.deprecated)
      .map((item: OpenAPIV3.ParameterObject) => ({
        ...item,
        paramValue: jsonSchemaParser(item.schema, {}),
      }))
    // .forEach((item) => {
    //   if (item.in === 'path') {
    //     request.addUrlParameter(item.name, new DynamicString())
    //   }
    // })

    logger.log(p)
    return request
  }
}
