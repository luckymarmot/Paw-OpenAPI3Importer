import EnvironmentManager from 'lib/environment-manager'
import Paw from 'types/paw'

const ENV_DYNAMIC_VALUE = 'com.luckymarmot.EnvironmentVariableDynamicValue'
const REQ_DYNAMIC_VALUE = 'com.luckymarmot.RequestVariableDynamicValue'
const FILE_DYNAMIC_VALUE = 'com.luckymarmot.FileContentDynamicValue'

/**
 * @exports createDynamicValue
 * @summary \
 *
 * @param {Object<createDynamicValueParams>} opts -
 * @returns {DynamicValue} class instance
 */
export function createDynamicValue(
  type: string,
  props: { [key: string]: unknown },
): DynamicValue {
  return new DynamicValue(type, props)
}

/**
 * @exports createDynamicString
 * @summary
 *
 * @param {Array<DynamicStringComponent>} prop
 * @returns {DynamicString} class instance
 */
export function createDynamicString(
  prop: DynamicStringComponent[],
): DynamicString {
  return new DynamicString(...prop)
}

/**
 * @exports createEnvironmentValues
 * @summary
 *
 * @param {String} variableUUID -
 * @returns {DynamicValue} class instance
 */
export function createEnvValues(variableUUID: string): DynamicValue {
  return createDynamicValue(ENV_DYNAMIC_VALUE, { variableUUID })
}

/**
 * @exports createRequestValues
 * @summary
 *
 * @param {String} variableUUID -
 * @returns {DynamicValue} class instance
 */
export function createRequestValues(variableUUID: string): DynamicValue {
  return createDynamicValue(REQ_DYNAMIC_VALUE, { variableUUID })
}

/**
 * @exports createFileValues
 * @summary
 *
 * @returns {DynamicValue} class instance
 */
export function createFileValues(): DynamicValue {
  return createDynamicValue(FILE_DYNAMIC_VALUE, { bookmarkData: null })
}

type TransformStringType = {
  defaultValue: string
  envManager: EnvironmentManager
  stringInput: string
  requestInput: Paw.Request
}

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
export function transformString({
  defaultValue = '',
  envManager,
  stringInput,
  requestInput,
}: TransformStringType): string | DynamicString {
  const components: DynamicStringComponent[] = []
  return ''
}
