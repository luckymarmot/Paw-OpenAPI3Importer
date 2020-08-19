// eslint-disable-next-line import/extensions
import Paw from '../../../types-paw-api/paw';
// eslint-disable-next-line import/extensions
import OpenAPI, { BasicCredentialsLabel } from '../../../types-paw-api/openapi';
import ParametersConverter from './parameters-converter';

export default class AuthConverter {
  private request: Paw.Request;

  private openApi: OpenAPI.OpenAPIObject;

  constructor(request: Paw.Request, openApi: OpenAPI.OpenAPIObject) {
    this.request = request;
    this.openApi = openApi;
  }

  attachAuthFromOperationToRequest(
    operation: OpenAPI.OperationObject,
    parametersConverter: ParametersConverter,
  ): void {
    if (operation.security && operation.security.length > 0) {
      operation.security.forEach((securityRequirement) => {
        if (securityRequirement) {
          Object.keys(securityRequirement).forEach((authKey) => {
            const { securitySchemes = {} } = this.openApi.components as OpenAPI.ComponentsObject;
            if (securitySchemes && securitySchemes[authKey]) {
              const securityScheme = securitySchemes[authKey] as OpenAPI.SecuritySchemeObject;

              if (securityScheme.type === 'http' && securityScheme.scheme === 'basic') {
                this.parseHttpBasicAuth(authKey);
              } else if (securityScheme.type === 'http' && securityScheme.scheme === 'bearer') {
                this.parseHttpBearerAuth(authKey);
              } else if (securityScheme.type === 'apiKey') {
                this.parseApiKeyAuth(authKey, parametersConverter);
              } else if (securityScheme.type === 'oauth2') {
                this.parseOAuth2Auth(authKey);
              } else if (securityScheme.type === 'openIdConnect') {
                this.parseOpenIdConnectAuth(authKey);
              } else {
                throw new Error('No security match found');
              }
            }
          });
        }
      });
    }
  }

  private parseHttpBasicAuth(authKey: string): void {
    let username: string = '';
    let password: string = '';

    if (this.openApi.components && this.openApi.components.examples) {
      let found: boolean = false;
      Object.keys(this.openApi.components.examples).forEach((key) => {
        const { examples = {} } = this.openApi.components as OpenAPI.ComponentsObject;
        if (
          !found
          && key === authKey
          && examples
          && (examples[authKey] as OpenAPI.ExampleObject)?.summary === BasicCredentialsLabel
          && (examples[authKey] as OpenAPI.ExampleObject).value?.username
          && (examples[authKey] as OpenAPI.ExampleObject).value?.password
        ) {
          found = true;
          username = (examples[authKey] as OpenAPI.ExampleObject).value?.username;
          password = (examples[authKey] as OpenAPI.ExampleObject).value?.password;
        }
      });
    }

    this.request.httpBasicAuth = { username, password };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  private parseHttpBearerAuth(authKey: string): void {
    /**
     * @TODO
     */
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  private parseApiKeyAuth(authKey: string, parametersConverter: ParametersConverter): void {
    /**
     * @TODO
     * in: cookie
     * in: header
     * in: query
     */
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  private parseOAuth2Auth(authKey: string): void {
    /**
     * @TODO
     */
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  private parseOpenIdConnectAuth(authKey: string): void {
    /**
     * @TODO
     */
  }
}
