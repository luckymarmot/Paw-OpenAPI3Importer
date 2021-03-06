import Paw from "../../../types-paw-api/paw"
import OpenAPI, {NonRequiredLabel} from "../../../types-paw-api/openapi"

export default class ParametersConverter {
  private request: Paw.Request

  constructor(request: Paw.Request) {
    this.request = request
  }

  attachParametersFromOperationToRequest(operation: OpenAPI.OperationObject) {
    if (operation && operation.parameters) {
      operation.parameters.forEach(param => {
        switch ((param as OpenAPI.ParameterObject).in) {
          case "query":
            this.parseQueryParam(param as OpenAPI.ParameterObject)
            break
          case "path":
            this.parsePathParam(param as OpenAPI.ParameterObject)
            break
          case "header":
           this.parseHeader(param as OpenAPI.ParameterObject)
            break
          case "cookie":
            this.parseCookie(param as OpenAPI.ParameterObject)
            break
        }
      })
    }
  }

  private parseQueryParam(param: OpenAPI.ParameterObject): void {
    this.request.addUrlParameter((param as OpenAPI.ParameterObject).name, this.getValueFromParam(param))
  }

  private parsePathParam(param: OpenAPI.ParameterObject): void {
    let variable = this.request.addVariable((param as OpenAPI.ParameterObject).name, this.getValueFromParam(param), '')
    const example = this.getExampleFromParam(param as OpenAPI.ParameterObject)

    if (
      example
      && (example as OpenAPI.ExampleObject).summary
      && (example as OpenAPI.ExampleObject).summary === NonRequiredLabel
      && (example as OpenAPI.ExampleObject).value === true
    ) {
      /**
       * @TODO
       * this code is executed properly, but variable still is required in Paw -> needs to check why this is not working
       */
      variable.required = false
    }
  }

  private parseHeader(param: OpenAPI.ParameterObject): void {
    this.request.addHeader((param as OpenAPI.ParameterObject).name, this.getValueFromParam(param))
  }

  private parseCookie(param: OpenAPI.ParameterObject): void {
    let cookies = this.request.getHeaderByName('cookie')

    if (!cookies) {
      cookies = ''
    }

    cookies += `${(param as OpenAPI.ParameterObject).name}=${this.getValueFromParam(param)}; `

    this.request.setHeader('cookie', cookies)
  }

  private getValueFromParam(param: OpenAPI.ParameterObject): string {
    let value: string = ''
    const {schema = null} = (param as OpenAPI.ParameterObject)
    if (schema && (schema as OpenAPI.SchemaObject).default) {
      value = (schema as OpenAPI.SchemaObject).default
    }

    return value;
  }

  private getExampleFromParam(param: OpenAPI.ParameterObject): string {
    const {example = null} = (param as OpenAPI.ParameterObject)

    return example;
  }
}
