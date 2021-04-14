import Yaml from 'yaml'
import { OpenAPIV3 } from 'openapi-types'
import Paw from 'types/paw'
import PKG from '../../package.json'
import { logger } from 'utils'
import SwaggerParser from '@apidevtools/swagger-parser'

const { identifier, title, inputs, fileExtensions } = PKG.config

export default class OpenAPIv3Importer implements Paw.Importer {
  public static title = title
  public static inputs = inputs
  public static identifier = identifier
  public static fileExtensions = [...fileExtensions]

  /**
   * @method canImport
   * @see {@link https://paw.cloud/docs/extensions/create-importer}
   * @summary
   *    evaluates items and returns a bool indicating if the extension can import
   *    the items; alternatively, can return the level of confidence as a float
   *    between 0.0 (can't import) and 1.0 (can import for sure).
   * @param context - a context instance
   * @param items - an array of string items
   * @returns {number}
   */
  public canImport(context: Paw.Context, items: Paw.ExtensionItem[]): number {
    return items.reduce((acc, item: Paw.ExtensionItem) => {
      const doc = this.parseContent(item) as OpenAPIV3.Document
      if (!doc) return 0
      return (
        doc.openapi.substr(0, 3) === '3.0' && // allowed versions 3.0.*
        typeof doc.info === 'object' &&
        typeof doc.paths === 'object' &&
        Object.keys(doc.paths).length > 0
      )
    }, true)
      ? 1
      : 0
  }

  /**
   * @method import
   * @summary generates the output code
   * @see {@link https://paw.cloud/docs/extensions/create-importer}
   * @param {Object<Paw.Context>} context - a context instance
   * @param {Array<Paw.ExtensionItem>} items
   *  - an array of items, each is a dictionary with the properties
   * @param {Object<Paw.ExtensionOption>} options - extension options
   * @returns {Boolean}
   */
  public import(
    context: Paw.Context,
    items: Paw.ExtensionItem[],
    options: Paw.ExtensionOption,
  ): Promise<boolean> {
    // parse Yaml or JSON
    const object = this.parseContent(items[0])

    // init SwaggerParser
    const swagger = new SwaggerParser()

    // validate and import
    return swagger
      .validate(object)
      .then((data) => {
        logger.log('validation success', typeof data, data)

        // @TODO we can import here
        // just a test request below
        context.createRequest('Test OpenAPI Request', 'GET', 'https://httpbin.org/get', 'This is an endpoint imported from OpenAPI')

        return true
      })
      .catch((error) => {
        logger.log('validation failed', error.toString())

        // note: despite the confusing typings returning Promise(false)
        // will be considered a success
        // instead, throw an error (equivalent to `return Promise(new Error())`)
        throw error
      })
  }

  /**
   * @private
   * @method parseContent
   * @summary
   *  a private method that parses file content from string into an object.
   * @param {Object<Paw.ExtensionItem>} opts
   * @param {String} opts.mimeType
   * @param {String} opts.content
   * @returns {Object<OpenAPIV3.Document>}
   */
  private parseContent({
    mimeType,
    content,
  }: Paw.ExtensionItem): OpenAPIV3.Document {
    try {
      const context =
        mimeType === 'application/json'
          ? JSON.parse(content)
          : Yaml.parse(content)
      return context
    } catch (error) {
      logger.log(error)
      throw new Error(`Failed to parse OpenAPI file: ${error}`)
    }
  }
}
