// eslint-disable-next-line import/extensions
import OpenAPI from '../types-paw-api/openapi';

export default class URL {
  hostname: string;

  pathname: string;

  port: string;

  fullUrl: string;

  constructor(url: string) {
    this.fullUrl = url;

    const match = url.match(/^([^:]+):\/\/([^:/]+)(?::([0-9]*))?(?:(\/.*))?$/i);

    if (match) {
      if (match[2]) {
        let host = 'http';
        if (match[1]) {
          // eslint-disable-next-line prefer-destructuring
          host = match[1];
        }

        this.hostname = URL.addSlashAtEnd(`${host}://${match[2]}`);
      }

      if (match[3]) {
        // eslint-disable-next-line prefer-destructuring
        this.port = match[3];
      }

      if (match[4]) {
        this.pathname = URL.addSlashAtEnd(match[4]);
      } else {
        this.pathname = '/';
      }
    }
  }

  static addSlashAtEnd(variable: string): string {
    if (variable[variable.length - 1] !== '/') {
      return `${variable}/`;
    }

    return variable;
  }

  static removeSlashFromEnd(variable: string): string {
    if (variable[variable.length - 1] === '/') {
      return variable.substr(0, variable.length - 1);
    }

    return variable;
  }

  static getFullUrlFromOpenAPI(
    pathItem: OpenAPI.PathItemObject,
    openApi: OpenAPI.OpenAPIObject,
    path: string,
  ): string {
    let url: string = '';
    let server: OpenAPI.ServerObject = { url };

    if (pathItem.servers && pathItem.servers.length > 0) {
      url = pathItem.servers[0].url;
      // eslint-disable-next-line prefer-destructuring
      server = pathItem.servers[0];
    } else if (openApi.servers && openApi.servers.length > 0) {
      url = openApi.servers[0].url;
      // eslint-disable-next-line prefer-destructuring
      server = openApi.servers[0];
    } else {
      throw new Error('No url found');
    }

    return `${
      URL.replaceServerVariablesWithDefaults(
        server,
        URL.removeSlashFromEnd(
          url,
        ),
      )
    }${path}`;
  }

  static replaceServerVariablesWithDefaults(server: OpenAPI.ServerObject, url: string) {
    if (server.variables) {
      let newUrl = url;
      Object.entries(server.variables).forEach(([variableName, variable]) => {
        const variableValue = variable.default ?? variableName;
        newUrl = newUrl.replace(`{${variableName}}`, variableValue);
      });

      return newUrl;
    }

    return url;
  }
}
