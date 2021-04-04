import SwaggerParser from '@apidevtools/swagger-parser'
import Yaml from 'yaml'
import { OpenAPIV3 } from 'openapi-types'
import Paw from 'types/paw'
import { logger } from 'utils'
import PKG from '../../package.json'

const { identifier, title, inputs, fileExtensions } = PKG.config

const asyncValidator = (content: OpenAPIV3.Document) =>
  new Promise((resolve, reject) => {
    const swagger = new SwaggerParser()
    // SwaggerParser.validate(content, function callback(error, context) {
    //   logger.log('error', error)
    //   logger.log('success', context)
    //   if (!error) return resolve(context)
    //   return reject(error as Error)
    // })
    swagger
      .validate(content)
      .then((data) => {
        logger.log('success', data)
        resolve(data)
      })
      .catch((error) => {
        logger.log('error', error)
        reject(error)
      })
  })

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
    return 1
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
    // this section is a test to see whether Promises work in webkit runtime
    // it seems like it's not because `setImmediate` is used by the library
    // while the api is not available in webkit runtime !@#$%
    return asyncValidator(this.parseContent(items[0]))
      .then((data) => {
        logger.log('success', data)
        return true
      })
      .catch((err) => {
        logger.log('error', err)
        return false
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
    const context =
      mimeType === 'application/json'
        ? JSON.parse(content)
        : Yaml.parse(content)
    return context
  }
}
