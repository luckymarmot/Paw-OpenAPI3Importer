import Yaml from 'yaml'
// eslint-disable-next-line import/extensions
import Paw from 'types/paw'
// eslint-disable-next-line import/extensions
import OpenAPI from 'types/openapi'
import OpenAPIToPawConverter from './lib/openapi-to-paw-converter/openapi-to-paw-converter'

class OpenAPIImporter implements Paw.Importer {
  static identifier = 'com.luckymarmot.PawExtensions.OpenAPIImporter'

  static title = 'OpenAPI 3.0'

  converter: OpenAPIToPawConverter

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public canImport(_context: Paw.Context, items: Paw.ExtensionItem[]): number {
    return items.reduce((_acc, item) => {
      try {
        const openApi = this.parseExtensionItem(item)

        return (
          openApi.openapi.substr(0, 3) === '3.0' && // allowed versions 3.0.*
          typeof openApi.info === 'object' &&
          typeof openApi.paths === 'object' &&
          Object.keys(openApi.paths).length > 0
        )
      } catch (error) {
        return 0
      }
    }, true)
      ? 1
      : 0
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public import(
    context: Paw.Context,
    items: Paw.ExtensionItem[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: Paw.ExtensionOption,
  ): boolean {
    this.converter = new OpenAPIToPawConverter(context)

    items.forEach((item) => {
      let openApi: OpenAPI.OpenAPIObject

      try {
        openApi = this.parseExtensionItem(item)
      } catch (error) {
        throw new Error('Invalid OpenAPI file')
      }

      const fileName =
        openApi.info.title ?? item.file?.name ?? 'OpenAPI 3.0 import'
      this.converter.convert(openApi, fileName)
    })

    return true
  }

  // eslint-disable-next-line class-methods-use-this
  private parseExtensionItem(item: Paw.ExtensionItem): OpenAPI.OpenAPIObject {
    if (item.mimeType === 'application/json') {
      return JSON.parse(item.content) as OpenAPI.OpenAPIObject
    }
    return Yaml.parse(item.content) as OpenAPI.OpenAPIObject
  }
}

registerImporter(OpenAPIImporter)
