import OpenAPI from "../types-paw-api/openapi"

export default class URL {
  hostname: string
  pathname: string
  port: string
  fullUrl: string

  constructor(url: string) {
    this.fullUrl = url

    const match = url.match(/^([^:]+):\/\/([^:/]+)(?::([0-9]*))?(?:(\/.*))?$/i)

    if (match) {
      if (match[2]) {
        let host = 'http'
        if (match[1]) {
          host = match[1]
        }

        this.hostname = URL.addSlashAtEnd(`${host}://${match[2]}`)
      }

      if (match[3]) {
        this.port = match[3]
      }

      if (match[4]) {
        this.pathname = URL.addSlashAtEnd(match[4])
      } else {
        this.pathname = '/'
      }
    }
  }

  static addSlashAtEnd(variable: string): string {
    if (variable[variable.length - 1] !== '/') {
      variable = `${variable}/`;
    }

    return variable
  }

  static removeSlashFromEnd(variable: string): string {
    if (variable[variable.length - 1] === '/') {
      variable = variable.substr(0, variable.length - 1)
    }

    return variable
  }

  static getFullUrlFromOpenAPI(pathItem: OpenAPI.PathItemObject, openApi: OpenAPI.OpenAPIObject, path: string): string {
    let url: string = ''

    if (pathItem.servers && pathItem.servers.length > 0) {
      url = pathItem.servers[0].url
    } else if (openApi.servers && openApi.servers.length > 0) {
      url = openApi.servers[0].url
    } else {
      throw new Error('No url found')
    }

    return `${URL.removeSlashFromEnd(url)}${path}`
  }

}
