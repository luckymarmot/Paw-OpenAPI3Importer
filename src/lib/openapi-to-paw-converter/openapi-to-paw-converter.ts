import Paw from "../../types-paw-api/paw"
import OpenAPI, {MapKeyedWithString} from "../../types-paw-api/openapi"
import URL from "../url"
import ParametersConverter from "./components/parameters-converter";
import AuthConverter from "./components/auth-converter";


export default class OpenAPIToPawConverter {
  private context: Paw.Context
  private requestGroups: MapKeyedWithString<Paw.RequestGroup>

  constructor(context: Paw.Context) {
    this.context = context
    this.requestGroups = {}
  }

  convert(openApi: OpenAPI.OpenAPIObject, sourceFileName: string) {
    if (openApi.paths) {

      Object.entries(openApi.paths).forEach(([pathName, pathItem]) => {
        const operations = this.extractOperationsFromPathItem(pathItem)

        Object.entries(operations).forEach(([method, operation]: [string, OpenAPI.OperationObject]) => {
          method = method.toUpperCase()
          const fullUrl = URL.getFullUrlFromOpenAPI(pathItem, openApi, pathName)

          const requestGroup = this.getRequestGroup(sourceFileName)
          let request = this.importBaseRequestToPaw(method, fullUrl, operation)
          requestGroup.appendChild(request)

          const parametersConverter = new ParametersConverter(request)
          parametersConverter.attachParametersFromOperationToRequest(operation)

          const authConverter = new AuthConverter(request, openApi)
          authConverter.attachAuthFromOperationToRequest(operation, parametersConverter)

          this.parseBody(request, operation)
        })
      })
    }
  }

  private extractOperationsFromPathItem(pathItem: OpenAPI.PathItemObject): MapKeyedWithString<OpenAPI.OperationObject> {
    const {$ref = null, summary = null, description = null, servers = null, parameters = null, ...operations} = pathItem

    return operations as MapKeyedWithString<OpenAPI.OperationObject>
  }

  private getRequestGroup(sourceFileName: string): Paw.RequestGroup
  {
     if (typeof this.requestGroups[sourceFileName] === 'undefined') {
       const formattedGroupName = sourceFileName.replace(/\.json|\.yaml/i, '')
       this.requestGroups[sourceFileName] = this.context.createRequestGroup(formattedGroupName);
     }

     return this.requestGroups[sourceFileName];
  }

  private importBaseRequestToPaw(method: string, fullUrl: string, operation: OpenAPI.OperationObject): Paw.Request {
    return this.context.createRequest(operation.summary, method, fullUrl, operation.description ?? null)
  }

  private parseBody(request: Paw.Request, operation: OpenAPI.OperationObject) {
    if ((operation?.requestBody as OpenAPI.RequestBodyObject)?.content) {
      Object.entries((operation.requestBody as OpenAPI.RequestBodyObject).content).forEach(([contentType, mediaType]: [string, OpenAPI.MediaTypeObject]) => {
        if ((mediaType.example as OpenAPI.ExampleObject)?.value) {
          request.body = (mediaType.example as OpenAPI.ExampleObject).value
        }

        /**
         * @TODO
         * probably needs to support other types of bodies as well
         * - request.jsonBody
         * - request.multipartBody
         * - request.urlEncodedBody
         */

        /**
         * @TODO
         * probably some encoding needed here as well
         */
      })
    }
  }
}
