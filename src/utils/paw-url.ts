import { OpenAPIV3 } from 'openapi-types'
import Paw from 'types/paw'
import EnvironmentManager from './environment'
import { convertEnvString } from './dynamic-values'

export interface PawURLOptions {
  openApi: OpenAPIV3.Document
  pathItem: OpenAPIV3.PathItemObject
  envManager: EnvironmentManager
  pathName: string
  request: Paw.Request
}

export default class PawURL {
  hostname: string
  pathname: string
  port: string
  fullUrl: string | DynamicString
  serverVariables: MapKeyedWithString<OpenAPIV3.ServerVariableObject>
  constructor(
    pathItem: OpenAPIV3.PathItemObject,
    openApi: OpenAPIV3.Document,
    pathName: string,
    envManager: EnvironmentManager,
    request: Paw.Request,
  ) {
    let server: OpenAPIV3.ServerObject = { url: '' }
    let match: RegExpMatchArray | null = []

    if (pathItem.servers && pathItem.servers.length > 0) {
      this.fullUrl = `${PawURL.removeSlashFromEnd(
        pathItem.servers[0].url,
      )}${pathName}`
      // eslint-disable-next-line prefer-destructuring
      server = pathItem.servers[0]
    } else if (openApi.servers && openApi.servers.length > 0) {
      this.fullUrl = `${PawURL.removeSlashFromEnd(
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

        this.hostname = PawURL.addSlashAtEnd(`${host}://${match[2]}`)
      }

      if (match[3]) {
        // eslint-disable-next-line prefer-destructuring
        this.port = match[3]
      }

      if (match[4]) {
        this.pathname = PawURL.addSlashAtEnd(match[4]).replace(
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
