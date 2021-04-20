/**
 * @function mapToGroup
 * @summary
 * @param {Object<string>} item
 * @returns {Object<CreateRequestGroupType>}
 */
export function mapToGroup(item: string): CreateRequestGroupType | null {
  const names = item.split('/')
  if (names.length === 0) return null
  return {
    group: names.filter((str) => str !== '')[0],
    paths: [item],
  }
}

/**
 * @function createGroup
 * @summary
 * @param {Object<CreateRequestGroupType>} item
 * @returns {Object<CreateRequestGroupType>}
 */
export function mapToCapitalize(
  item: CreateRequestGroupType,
): CreateRequestGroupType {
  return {
    group: `${item.group.charAt(0).toUpperCase()}${item.group.slice(1)}`,
    paths: [...item.paths],
  }
}

/**
 * @function createGroup
 * @summary
 * @param {Array<CreateRequestGroupType>} accumulator
 * @param {Object<CreateRequestGroupType>} current
 * @returns {Object<CreateRequestGroupType>}
 */
export function createGroup(
  accumulator: CreateRequestGroupType[],
  current: CreateRequestGroupType,
): CreateRequestGroupType[] {
  const occurence = accumulator.reduce(
    (acc, item: CreateRequestGroupType, arr) =>
      item.group === current.group ? arr : acc,
    -1,
  )

  let objectvalue = accumulator[occurence] as CreateRequestGroupType
  if (occurence >= 0) {
    objectvalue.paths = objectvalue.paths.concat(current.paths)
    return accumulator
  }

  const currentObject: CreateRequestGroupType = {
    group: current.group,
    paths: Array.isArray(current.paths) ? [...current.paths] : current.paths,
  }

  accumulator = accumulator.concat([currentObject as never])
  return accumulator
}
