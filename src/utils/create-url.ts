import { OpenAPIV3 } from 'openapi-types'
import Paw from 'types/paw'
import EnvironmentManager from 'lib/environment-manager'

export interface CreateURLOptions {
  openApi: OpenAPIV3.Document
  pathItem: OpenAPIV3.PathItemObject
  envManager: EnvironmentManager
  pathName: string
  request: Paw.Request
}

export default function createURL({
  pathItem,
  openApi,
  pathName,
  envManager,
  request,
}: CreateURLOptions): string | DynamicString {
  return ''
}
