import Paw from 'types/paw'

/**
 * @deprecated
 * OpenAPI - manual type declaraion of openapi typinggs
 * OpenAPIV3 - utilize openapi types instead
 */
import { MapKeyedWithString } from 'types/openapi'
import { OpenAPIV3 } from 'openapi-types'

import Console from 'console'

export default class BodyConverter {
  private request: Paw.Request

  constructor(request: Paw.Request) {
    this.request = request
  }

  attachBodyFromOperationToRequest(operation: OpenAPIV3.OperationObject) {
    if ((operation?.requestBody as OpenAPIV3.RequestBodyObject)?.content) {
      Object.entries(
        (operation.requestBody as OpenAPIV3.RequestBodyObject).content,
      )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .forEach(
          ([contentType, mediaType]: [string, OpenAPIV3.MediaTypeObject]) => {
            let body = '' as any

            if ((mediaType.example as OpenAPIV3.ExampleObject)?.value) {
              body = (mediaType.example as OpenAPIV3.ExampleObject).value
            } else if (
              mediaType.examples &&
              Object.keys(
                mediaType.examples as MapKeyedWithString<OpenAPIV3.ExampleObject>,
              ).length > 0
            ) {
              const { examples } = mediaType
              const firstExampleKey = Object.keys(examples)[0]
              if (
                (examples[firstExampleKey] as OpenAPIV3.ExampleObject).value
              ) {
                body = (examples[firstExampleKey] as OpenAPIV3.ExampleObject)
                  .value
              }
            }

            if (body) {
              switch (contentType.toLowerCase()) {
                case 'application/json':
                  this.request.jsonBody = BodyConverter.parseToJsonIfString(
                    body,
                  )
                  break
                case 'application/x-www-form-urlencoded':
                  this.request.urlEncodedBody = BodyConverter.parseToKeyValueMap(
                    body,
                  ) as MapKeyedWithString<string>
                  break
                case 'multipart/form-data':
                  this.request.multipartBody = BodyConverter.parseToKeyValueMap(
                    body,
                  ) as MapKeyedWithString<string>
                  break
                default:
                  this.request.body = BodyConverter.stringifyIfNotString(body)
              }
            }
          },
        )
    }
  }

  static stringifyIfNotString(value: any): string {
    return typeof value !== 'string' ? value : JSON.stringify(value)
  }

  static parseToJsonIfString(value: any): object | MapKeyedWithString<string> {
    if (typeof value !== 'string') {
      return value
    }

    try {
      return JSON.parse(value)
    } catch (e) {
      Console.error('Error while parsing JSON body', e)
      return { value }
    }
  }

  static parseToKeyValueMap(
    values: any,
  ): MapKeyedWithString<string | DynamicString> {
    const pawParams: { [key: string]: string | DynamicString } = {}

    if (Array.isArray(values)) {
      values.forEach((param) => {
        const key: string = param.key || ''
        pawParams[key] = param.value || ''
      })
    } else if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]: [string, string]) => {
        pawParams[key] = value
      })
    }

    return pawParams
  }
}
