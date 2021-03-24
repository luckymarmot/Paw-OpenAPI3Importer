import Paw from 'types/paw'
import PKG from '../../package.json'
import { OpenAPIV3 } from 'openapi-types'

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
  ): boolean {
    return true
  }

  private validate(item: Paw.ExtensionItem): OpenAPIV3.Document | null {
    return {} as OpenAPIV3.Document
  }
}
