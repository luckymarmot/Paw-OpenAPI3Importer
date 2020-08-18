/* eslint-disable class-methods-use-this */
import Yaml from "yaml"
import URL from "./lib/url"
import Paw from "./types-paw-api/paw"
import OpenAPI, {NonRequiredLabel, BasicCredentialsLabel} from "./types-paw-api/openapi"
import OpenAPIToPawConverter from "./lib/openapi-to-paw-converter/openapi-to-paw-converter";

class OpenAPIImporter implements Paw.Importer {
  static identifier = 'com.luckymarmot.PawExtensions.OpenAPIImporter'
  static title = 'OpenAPI 3.0 Importer'

  converter: OpenAPIToPawConverter

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public canImport(context: Paw.Context, items: Paw.ExtensionItem[]): number {
    return items.reduce((acc, item) => {
      try {
        const openApi = this.parseExtensionItem(item)

        return (
          typeof openApi.openapi === 'string' &&
          openApi.openapi.substr(0, 3) === '3.0' && //allowed versions 3.0.*
          typeof openApi.info === 'object' &&
          typeof openApi.paths === 'object' &&
          Object.keys(openApi.paths).length > 0
        )
      } catch (error) {
        return 0
      }
    }, true) ? 1 : 0
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public import(context: Paw.Context, items: Paw.ExtensionItem[], options: Paw.ExtensionOption): boolean {
    this.converter = new OpenAPIToPawConverter(context)

    items.forEach((item) => {
      let openApi: OpenAPI.OpenAPIObject
      const fileName = item.file?.name ?? 'OpenAPI 3.0 import'

      try {
        openApi = this.parseExtensionItem(item)
      } catch (error) {
        throw new Error('Invalid OpenAPI file')
      }

      this.converter.convert(openApi, fileName)
    })

    return true
  }

  private parseExtensionItem(item: Paw.ExtensionItem): OpenAPI.OpenAPIObject {
    if (item.mimeType === 'application/json') {
      return JSON.parse(item.content) as OpenAPI.OpenAPIObject
    } else {
      return Yaml.parse(item.content) as OpenAPI.OpenAPIObject
    }
  }
}

registerImporter(OpenAPIImporter)
