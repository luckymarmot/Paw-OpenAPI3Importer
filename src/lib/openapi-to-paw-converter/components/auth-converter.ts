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
                this.parseHttpBearerAuth();
              } else if (securityScheme.type === 'apiKey') {
                this.parseApiKeyAuth(
                  securityScheme.name,
                  securityScheme.in,
                  parametersConverter,
                );
              } else if (securityScheme.type === 'oauth2') {
                this.parseOAuth2Auth(securityScheme.flows);
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
  private parseHttpBearerAuth(): void {
    let value = '';
    const authHeader = this.request.getHeaderByName('authorization');
    if (authHeader) {
      value = (authHeader as string).replace(/bearer /i, '');
    }

    this.request.addHeader('Authorization', `Bearer ${value}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  private parseApiKeyAuth(
    authName: string,
    authIn: string,
    parametersConverter: ParametersConverter,
  ): void {
    let value = '';

    if (authIn === 'query') {
      value = this.request.getUrlParameterByName(authName) as string;
      this.request.addUrlParameter((authName || ''), (value || ''));
    } else if (authIn === 'header') {
      value = this.request.getHeaderByName(authName) as string;
      this.request.addHeader((authName || ''), (value || ''));
    } else if (authIn === 'cookie') {
      parametersConverter.parseCookie({ name: authName, in: 'cookie', schema: { default: value } });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  private parseOAuth2Auth(flows: OpenAPI.OAuthFlowsObject): void {
    if (Object.keys(flows).length > 0) {
      const grantType = Object.keys(flows)[0] as string;
      if (
        grantType === 'implicit'
        || grantType === 'password'
        || grantType === 'clientCredentials'
        || grantType === 'authorizationCode'
      ) {
        const flow = flows[grantType] as OpenAPI.OAuthFlowObject;

        this.request.oauth2 = {
          client_id: '',
          client_secret: '',
          authorization_uri: flow.authorizationUrl,
          access_token_uri: flow.tokenUrl,
          redirect_uri: '',
          scope: JSON.stringify(flow.scopes),
          state: undefined,
          token: undefined,
          token_prefix: undefined,
          grant_type: grantType,
        };
      }
    }
  }
}
