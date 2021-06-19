import { OpenAPIV3 } from 'openapi-types'
import Paw from 'types/paw'
import EnvironmentManager from './environment'
import { convertEnvString } from './dynamic-values'
import logger from './console'

export interface PawURLOptions {
  openApi: OpenAPIV3.Document
  pathItem: OpenAPIV3.PathItemObject
  envManager: EnvironmentManager
  pathName: string
  request: Paw.Request
}

export default class PawURL {
  public hostname: string
  public pathname: string
  public port: string
  public fullUrl: string | DynamicString
  public defaultURL = 'https://echo.paw.cloud'
  constructor(
    pathItem: OpenAPIV3.PathItemObject,
    openApi: OpenAPIV3.Document,
    pathName: string,
    envManager: EnvironmentManager,
    request: Paw.Request,
  ) {
    let baseURL = this.createURL()

    if (pathItem.servers && pathItem.servers.length > 0) {
      baseURL = this.createURL(pathItem.servers[0].url)
      logger.log(baseURL.href)
    }

    if (openApi.servers && openApi.servers.length > 0) {
      baseURL = this.createURL(openApi.servers[0].url)
    }

    baseURL.pathname += pathName

    if (/^(\/\/)/g.test(baseURL.pathname)) {
      baseURL.pathname = baseURL.pathname.replace(/^(\/\/)/g, '/')
    }

    const url = baseURL.href.replace(/%7B/g, '{').replace(/%7D/g, '}') + '/'
    this.hostname = baseURL.hostname
    this.pathname = baseURL.pathname
    this.port = baseURL.port

    this.fullUrl = convertEnvString(url, request, envManager) as DynamicString
    return this
  }

  public createURL(url?: string): URL {
    if (!url) return new URL(this.defaultURL)
    try {
      return new URL(url)
    } catch (error) {
      return new URL(url, this.defaultURL)
    }
  }
}
