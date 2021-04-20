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

type ExtendedParamObject = OpenAPIV3.ParameterObject & {
  parameterExampleValue?: any
  variableId?: string
}

type ExtendedSecuritySchemeObject = OpenAPIV3.SecuritySchemeObject & {
  key: string
  value: string[]
}

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
    return this.envManagers[title]
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
      let security = null

      if (requestContext.requestBody) {
        requestBody = requestContext.requestBody
      }

      if (requestContext.parameters) {
        parameters = requestContext.parameters
      }

      if (requestContext.responses) {
        const accepts = Object.entries(requestContext.responses)
          .map(([key, value]) => {
            const ctx = value as OpenAPIV3.ResponseObject
            return ctx.content ? Object.keys(ctx.content) : []
          })
          .flat()
        responses = accepts.length > 0 ? accepts : '*/*'
      }

      if (requestContext.servers) {
        servers = requestContext.servers
      }

      if (requestContext.security) {
        security = requestContext.security
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
        security,
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

    if (item.requestBody) {
      this.setRequesBody(
        request,
        item.requestBody as OpenAPIV3.RequestBodyObject,
      )
    }

    if (item.parameters) {
      this.setRequestParameters(item.parameters, request)
    }

    if (item.security) {
      this.setRequestAuth(item.security, request)
    }

    if (item.responses) {
      request.setHeader('Accepts', item.responses[0])
    }

    const requestURL = new PawURL(
      document.paths[item.path] as OpenAPIV3.PathItemObject,
      document,
      item.path,
      this.getEnviroment(),
      request,
    )

    request.url = requestURL.fullUrl
    this.requestGroups[item.group].appendChild(request)

    if (requestURL.serverVariables) {
      const envManager = this.envManagers[title]
      const serverVars = requestURL.serverVariables

      // Object.entries(serverVars).forEach(([varName, variable]) => {
      //   const value = variable.default
      //   envManager.setEnvironmentVariableValue(varName, value)
      //   request.addVariable(
      //     varName,
      //     envManager.getDynamicString(varName),
      //     variable.description || '',
      //   )
      // })
    }
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
    params: OpenAPIV3.ParameterObject[],
    request: Paw.Request,
  ): Paw.Request {
    if (params.length === 0) return request
    const envManager = this.getEnviroment()

    function mapParameters(
      param: ExtendedParamObject,
      index?: number,
      arr?: ExtendedParamObject[],
    ): void {
      const {
        name,
        description,
        parameterExampleValue,
        schema,
        required,
      } = param
      const DYNAMIC_REQUEST_VARIABLE =
        'com.luckymarmot.RequestVariableDynamicValue'

      const variable = request.addVariable(
        name,
        parameterExampleValue,
        description || '',
      )

      variable.schema = schema as any

      const createDynamicValue = new DynamicValue(DYNAMIC_REQUEST_VARIABLE, {
        variableUUID: variable.id,
      })

      variable.required = required || false

      if (param.in === 'path') {
        envManager.setEnvironmentVariableValue(
          param.name,
          parameterExampleValue,
        )
        return
      }
      if (param.in === 'header') {
        request.addHeader(
          name,
          new DynamicString(createDynamicValue) || parameterExampleValue,
        )
        return
      }

      if (param.in === 'query') {
        request.addUrlParameter(
          name,
          new DynamicString(createDynamicValue) || parameterExampleValue,
        )
        return
      }
    }

    const parameters = params
      .filter((param: OpenAPIV3.ParameterObject) => !param.deprecated)
      .map((parameterItem: OpenAPIV3.ParameterObject) => {
        const schema = parameterItem.schema
          ? jsonSchemaParser(parameterItem.schema as OpenAPIV3.SchemaObject)
          : ''
        return {
          ...parameterItem,
          parameterExampleValue: schema,
        } as ExtendedParamObject
      })

    // attach request parameter variables here
    parameters.forEach(mapParameters)
    return request
  }

  private setRequestAuth(
    securityTypes: OpenAPIV3.SecurityRequirementObject[],
    request: Paw.Request,
  ): Paw.Request {
    const envManager = this.getEnviroment()
    const document = this.apiParser.api as OpenAPIV3.Document
    // Because there are no references to refer to
    if (!document.components || !document.components.securitySchemes)
      return request

    const securitySchemes = document.components.securitySchemes as {
      [key: string]: OpenAPIV3.SecuritySchemeObject
    }

    const security = [...securityTypes]
      .map(
        (
          item: OpenAPIV3.SecurityRequirementObject,
        ): ExtendedSecuritySchemeObject[] =>
          Object.keys(item).map((key) => ({
            ...securitySchemes[key],
            value: item[key],
            key,
          })),
      )
      .flat() as ExtendedSecuritySchemeObject[]

    const snakeCase = (str: string): string =>
      str.replace(/[A-Z]/g, (cap) => `_${cap.toLowerCase()}`)

    function setRequestOAuth2(item: any) {
      if (!Object.keys(item).includes('flows')) return
      const grantType = Object.keys(item.flows)[0] as any
      const authFlow = item.flows[grantType]
      request.oauth2 = {
        client_id: '',
        client_secret: '',
        authorization_uri: authFlow.authorizationUrl,
        access_token_uri: authFlow.tokenUrl,
        redirect_uri: '',
        scope: `'${item.value}'`,
        state: undefined,
        token: undefined,
        token_prefix: undefined,
        grant_type: snakeCase(grantType),
      }
    }

    security.forEach((item: ExtendedSecuritySchemeObject) => {
      if (item.type === 'http' && item.scheme === 'basic') {
        request.httpBasicAuth = { username: '', password: '' }
      }

      if (item.type === 'oauth2') {
        setRequestOAuth2(
          item as ExtendedSecuritySchemeObject & OpenAPIV3.OAuth2SecurityScheme,
        )
      }

      if (
        (item.type === 'http' && item.scheme === 'bearer') ||
        item.type === 'apiKey'
      ) {
      }
    })

    return request
  }
}
