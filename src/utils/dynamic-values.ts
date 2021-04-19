import EnvironmentManager from './environment'
import Paw from 'types/paw'
import logger from './console'

const ENVIRONMENT_DYNAMIC_VALUE =
  'com.luckymarmot.EnvironmentVariableDynamicValue'
const REQUEST_DYNAMIC_VALUE = 'com.luckymarmot.RequestVariableDynamicValue'
const FILE_DYNAMIC_VALUE = 'com.luckymarmot.FileContentDynamicValue'

/**
 * @exports createDynamicValue
 * @summary
 *  - renamed from `makeDv`
 *
 * @param {Object<createDynamicValueParams>} opts -
 * @returns {DynamicValue} class instance
 */
export const createDynamicValue = (
  type: string,
  props?: { [key: string]: any },
): DynamicValue => new DynamicValue(type, props)

/**
 * @exports createDynamicString
 * @summary
 *  - renamed from `makeDs`
 *
 * @param {Array<DynamicStringComponent>} prop
 * @returns {DynamicString} class instance
 */
export const createDynamicString = (
  ...prop: DynamicStringComponent[]
): DynamicString => new DynamicString(...prop)
/**
 * @exports createEnvironmentValues
 * @summary
 *  - renamed from `makeEnvDv`
 *
 * @param {String} variableUUID -
 * @returns {DynamicValue} class instance
 */
export const createEnvDynamicValue = (
  environmentVariable: string,
): DynamicValue =>
  createDynamicValue(ENVIRONMENT_DYNAMIC_VALUE, {
    environmentVariable,
  })

/**
 * @exports createRequestValues
 * @summary
 *  - renamed from `makeRequestDv`
 *
 * @param {String} variableUUID -
 * @returns {DynamicValue} class instance
 */
export const createRequestValues = (variableId: string) =>
  createDynamicValue(REQUEST_DYNAMIC_VALUE, { variableId })

/**
 * @exports createFileValues
 * @summary
 *
 * @returns {DynamicValue} class instance
 */
export const createFileValues = (): DynamicValue =>
  createDynamicValue(FILE_DYNAMIC_VALUE, { bookmarkData: null })

/**
 * @exports transformString
 * @summary
 *
 * @param {Object<TransformStringType>} opts
 * @param {String} opts.defaultValue
 * @param {EnvironmentManager} opts.envManager
 * @param {String} opts.stringInput
 * @param {Object<Paw.Request>} opts.requestInput
 *
 * @returns {DynamicValue} class instance
 */
export function convertEnvString(
  s: string,
  envManager: EnvironmentManager,
  defaultValue: string = '',
  request: Paw.Request,
): string | DynamicString {
  const re = /\{([^}]+)\}/g
  let match
  const components: DynamicStringComponent[] = []
  let idx = 0

  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(s))) {
    // push any string here before
    if (match.index > idx) {
      components.push(s.substr(idx, match.index - idx))
    }

    if (envManager.hasEnvironmentVariable(match[1])) {
      envManager.setEnvironmentVariableValue(match[1], defaultValue)
      components.push(envManager.getDynamicValue(match[1]))
    } else {
      let requestVariable = request.getVariableByName(match[1])
      if (requestVariable && requestVariable.id) {
        components.push(
          new DynamicValue('com.luckymarmot.RequestVariableDynamicValue', {
            variableUUID: requestVariable.id,
          }),
        )
      }
    }

    idx = match.index + match[0].length
  }

  // add remaining string
  if (idx < s.length) {
    components.push(s.substr(idx))
  }

  // return
  if (components.length === 0) {
    return ''
  }
  if (components.length === 1 && typeof components[0] === 'string') {
    return components[0]
  }

  return createDynamicString(...components)
}
