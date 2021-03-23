// eslint-disable-next-line import/extensions
import OpenAPI, { MapKeyedWithString } from 'types/openapi'
import EnvironmentManager from './environment-manager'
import { convertEnvString } from './paw-utils'
import Paw from 'types/paw'

export default class URL {
  hostname: string

  pathname: string

  port: string

  fullUrl: string | DynamicString

  serverVariables: MapKeyedWithString<OpenAPI.ServerVariableObject>

  constructor(
    pathItem: OpenAPI.PathItemObject,
    openApi: OpenAPI.OpenAPIObject,
    pathName: string,
    envManager: EnvironmentManager,
    request: Paw.Request,
  ) {
    let server: OpenAPI.ServerObject = { url: '' }
    let match: RegExpMatchArray | null = []

    if (pathItem.servers && pathItem.servers.length > 0) {
      this.fullUrl = `${URL.removeSlashFromEnd(
        pathItem.servers[0].url,
      )}${pathName}`
      // eslint-disable-next-line prefer-destructuring
      server = pathItem.servers[0]
    } else if (openApi.servers && openApi.servers.length > 0) {
      this.fullUrl = `${URL.removeSlashFromEnd(
        openApi.servers[0].url,
      )}${pathName}`
      // eslint-disable-next-line prefer-destructuring
      server = openApi.servers[0]
    }

    if (server.variables) {
      this.serverVariables = server.variables
    }

    this.fullUrl = convertEnvString(
      this.fullUrl as string,
      envManager,
      '',
      request,
    )

    if (typeof this.fullUrl === 'string') {
      match = this.fullUrl.match(
        /^([^:]+):\/\/([^:/]+)(?::([0-9]*))?(?:(\/.*))?$/i,
      )
    } else {
      match = (this.fullUrl as DynamicString)
        .getEvaluatedString()
        .match(/^([^:]+):\/\/([^:/]+)(?::([0-9]*))?(?:(\/.*))?$/i)
    }

    if (match) {
      if (match[2]) {
        let host = 'http'
        if (match[1]) {
          // eslint-disable-next-line prefer-destructuring
          host = match[1]
        }

        this.hostname = URL.addSlashAtEnd(`${host}://${match[2]}`)
      }

      if (match[3]) {
        // eslint-disable-next-line prefer-destructuring
        this.port = match[3]
      }

      if (match[4]) {
        this.pathname = URL.addSlashAtEnd(match[4]).replace(
          new RegExp('//', 'g'),
          '/',
        )
      } else {
        this.pathname = '/'
      }
    }
  }

  static addSlashAtEnd(variable: string): string {
    if (variable[variable.length - 1] !== '/') {
      return `${variable}/`
    }

    return variable
  }

  static removeSlashFromEnd(variable: string): string {
    if (variable[variable.length - 1] === '/') {
      return variable.substr(0, variable.length - 1)
    }

    return variable
  }
}
