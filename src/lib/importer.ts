import Yaml from 'yaml'
import SwaggerParser, { resolve } from '@apidevtools/swagger-parser'
import { OpenAPIV3 } from 'openapi-types'
import Paw from 'types/paw'
import PawConverter from './converter'
import config from '../paw.config'
import { logger } from 'utils'

const { identifier, title, inputs, fileExtensions } = config

export default class OpenAPIv3Importer implements Paw.Importer {
  public static title = title
  public static inputs = inputs
  public static identifier = identifier
  public static fileExtensions = [...fileExtensions]

  /**
   * @property {Object<SwaggerParser.Options>} parserOptions
   *  - swarggger parser options
   */
  private parserOptions: SwaggerParser.Options = {
    resolve: {
      file: false,
    },
    dereference: {
      circular: true,
    },
  }

  /**
   * @method canImport
   * @see {@link https://paw.cloud/docs/extensions/create-importer}
   * @summary
   *    evaluates items and returns a bool indicating if the extension can import
   *    the items; alternatively, can return the level of confidence as a float
   *    between 0.0 (can't import) and 1.0 (can import for sure).
   *
   * @param context - a context instance
   * @param items - an array of string items
   *
   * @returns {number}
   */
  public canImport(context: Paw.Context, items: Paw.ExtensionItem[]): number {
    return items.reduce((acc, item: Paw.ExtensionItem) => {
      const doc = this.parseContent(item) as OpenAPIV3.Document

      if (!doc || !doc.openapi) return 0

      return (
        doc.openapi.substr(0, 1) === '3.0' && // allowed versions 3.0.x.*
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
   *
   * @param {Object<Paw.Context>} context - a context instance
   * @param {Array<Paw.ExtensionItem>} items
   *  - an array of items, each is a dictionary with the properties
   *
   * @param {Object<Paw.ExtensionOption>} options - extension options
   * @returns {Boolean}
   */
  public import(
    context: Paw.Context,
    items: Paw.ExtensionItem[],
    options: Paw.ExtensionOption,
  ): Promise<boolean> {
    const documents = items.map((item: Paw.ExtensionItem) => {
      const doc = this.parseContent(item)
      return new Promise((resolve, reject) => {
        if (Object.prototype.hasOwnProperty.call(doc, 'name')) {
          reject(new Error(`${doc.name}\n ${doc.message}.`))
          return
        }

        const apiParser = new SwaggerParser()
        const filename =
          item.file?.name.replace(/\.(yml|yaml|json)$/, '') || item.name

        apiParser
          .validate(doc, this.parserOptions)
          .then(() => {
            const convertDocument = new PawConverter(
              apiParser,
              filename,
              context,
            )
            convertDocument.init()
            resolve(apiParser.api)
          })
          .catch((error) => reject(error))
      })
    })

    return Promise.all(documents)
      .then((data) => data.length > 0)
      .catch((error) => {
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
  private parseContent({ mimeType, content }: Paw.ExtensionItem): any {
    try {
      const context =
        mimeType === 'application/json'
          ? JSON.parse(content)
          : Yaml.parse(content, { prettyErrors: true })
      return context
    } catch (error) {
      return error
    }
  }
}
