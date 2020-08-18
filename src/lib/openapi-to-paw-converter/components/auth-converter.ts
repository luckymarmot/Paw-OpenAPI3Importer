import Paw from "../../../types-paw-api/paw"
import OpenAPI, {BasicCredentialsLabel} from "../../../types-paw-api/openapi"
import ParametersConverter from "./parameters-converter";

export default class AuthConverter {
  private request: Paw.Request
  private openApi: OpenAPI.OpenAPIObject

  constructor(request: Paw.Request, openApi: OpenAPI.OpenAPIObject) {
    this.request = request
    this.openApi = openApi
  }

  attachAuthFromOperationToRequest(operation: OpenAPI.OperationObject, parametersConverter: ParametersConverter): void {
    if (operation.security && operation.security.length > 0) {
      operation.security.forEach((securityRequirement) => {
        if (securityRequirement) {
          Object.keys(securityRequirement).forEach((authKey) => {
            if (this.openApi.components?.securitySchemes && this.openApi.components?.securitySchemes[authKey]) {
              const securityScheme = this.openApi.components.securitySchemes[authKey] as OpenAPI.SecuritySchemeObject

              if (securityScheme.type === 'http' && securityScheme.scheme === 'basic') {
                this.parseHttpBasicAuth(authKey)
              } else if (securityScheme.type === 'http' && securityScheme.scheme === 'bearer') {
                this.parseHttpBearerAuth(authKey)
              } else if (securityScheme.type === 'apiKey') {
                this.parseApiKeyAuth(authKey, parametersConverter)
              } else if (securityScheme.type === 'oauth2') {
                this.parseOAuth2Auth(authKey)
              } else if (securityScheme.type === 'openIdConnect') {
                this.parseOpenIdConnectAuth(authKey)
              } else {
                throw new Error('No security match found')
              }
            }
          })
        }
      })
    }
  }


  private parseHttpBasicAuth(authKey: string): void {
    let username: string = ''
    let password: string = ''

    if (this.openApi.components && this.openApi.components.examples) {
      let found: boolean = false
      Object.keys(this.openApi.components.examples).forEach(key => {
        if (
          !found
          && key === authKey
          && this.openApi.components?.examples
          && (this.openApi.components?.examples[authKey] as OpenAPI.ExampleObject)?.summary === BasicCredentialsLabel
          && (this.openApi.components?.examples[authKey] as OpenAPI.ExampleObject).value?.username
          && (this.openApi.components?.examples[authKey] as OpenAPI.ExampleObject).value?.password
        ) {
          found = true
          username = (this.openApi.components?.examples[authKey] as OpenAPI.ExampleObject).value?.username
          password = (this.openApi.components?.examples[authKey] as OpenAPI.ExampleObject).value?.password
        }
      })
    }

    this.request.httpBasicAuth = {username, password}
  }

  private parseHttpBearerAuth(authKey: string): void {
    /**
     * @TODO
     */
  }

  private parseApiKeyAuth(authKey: string, parametersConverter: ParametersConverter): void {
    /**
     * @TODO
     * in: cookie
     * in: header
     * in: query
     */
  }

  private parseOAuth2Auth(authKey: string): void {
    /**
     * @TODO
     */
  }

  private parseOpenIdConnectAuth(authKey: string): void {
    /**
     * @TODO
     */
  }
}
