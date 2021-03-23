import Paw from 'types/paw'

/**
 * @deprecated
 * OpenAPI - manual type declaraion of openapi typinggs
 * OpenAPIV3 - utilize openapi types instead
 */
import OpenAPI, { BasicCredentialsLabel } from 'types/openapi'
import { OpenAPIV3 } from 'openapi-types'

import Console from 'lib/console'

export default class AuthConverter {
  private request: Paw.Request

  private openApi: OpenAPIV3.Document

  constructor(request: Paw.Request, openApi: OpenAPIV3.Document) {
    this.request = request
    this.openApi = openApi
  }

  attachAuthFromOperationToRequest(operation: OpenAPIV3.OperationObject): void {
    if (operation.security && operation.security.length > 0) {
      operation.security.forEach((securityRequirement) => {
        if (securityRequirement) {
          Object.keys(securityRequirement).forEach((authKey) => {
            const { securitySchemes = {} } = this.openApi
              .components as OpenAPI.ComponentsObject
            if (securitySchemes && securitySchemes[authKey]) {
              const securityScheme = securitySchemes[
                authKey
              ] as OpenAPI.SecuritySchemeObject

              if (
                securityScheme.type === 'http' &&
                securityScheme.scheme === 'basic'
              ) {
                this.parseHttpBasicAuth(authKey)
              } else if (securityScheme.type === 'oauth2') {
                this.parseOAuth2Auth(securityScheme.flows)
              } else if (
                (securityScheme.type === 'http' &&
                  securityScheme.scheme === 'bearer') ||
                securityScheme.type === 'apiKey'
              ) {
                /**
                 * do nothing - credentials should be already parsed by ParametersConverter
                 */
              } else {
                Console.error('No security match found')
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
      Object.keys(this.openApi.components.examples).forEach((key) => {
        const { examples = {} } = this.openApi
          .components as OpenAPIV3.ComponentsObject
        if (
          !found &&
          key === authKey &&
          examples &&
          (examples[authKey] as OpenAPI.ExampleObject)?.summary ===
            BasicCredentialsLabel &&
          (examples[authKey] as OpenAPIV3.ExampleObject).value?.username &&
          (examples[authKey] as OpenAPIV3.ExampleObject).value?.password
        ) {
          found = true
          username = (examples[authKey] as OpenAPIV3.ExampleObject).value
            ?.username
          password = (examples[authKey] as OpenAPIV3.ExampleObject).value
            ?.password
        }
      })
    }

    this.request.httpBasicAuth = { username, password }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  private parseOAuth2Auth(flows: OpenAPI.OAuthFlowsObject): void {
    if (Object.keys(flows).length > 0) {
      const grantType = Object.keys(flows)[0] as string
      if (
        grantType === 'implicit' ||
        grantType === 'password' ||
        grantType === 'clientCredentials' ||
        grantType === 'authorizationCode'
      ) {
        const flow = flows[grantType] as OpenAPI.OAuthFlowObject

        this.request.oauth2 = {
          client_id: '',
          client_secret: '',
          authorization_uri: flow.authorizationUrl,
          access_token_uri: flow.tokenUrl,
          redirect_uri: '',
          scope: Object.keys(flow.scopes).join(' '),
          state: undefined,
          token: undefined,
          token_prefix: undefined,
          grant_type: AuthConverter.capitalToCamelCase(grantType),
        }
      }
    }
  }

  static capitalToCamelCase(string: string) {
    return string.replace(
      /[A-Z]/g,
      (capitalLetter) => `_${capitalLetter.toLowerCase()}`,
    )
  }
}
