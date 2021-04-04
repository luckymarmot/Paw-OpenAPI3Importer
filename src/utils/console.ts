const log = console.log

/**
 * @private
 * @function parseObjects
 * @summary
 *  a function that checks whether a string can be parsed as an object,
 *  will always return a formatted json string.
 * @param {unknown|any} data
 * @returns {string}
 */
function parseObjects(data: unknown): string {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }

  try {
    const context = JSON.parse(data as string)
    return parseObjects(context)
  } catch (error) {
    return data as string
  }
}

/**e
 * @function pseudoLog
 * @summary
 * abstracts the built-in console.log method which,
 * also stringify any object passed to it.
 *
 * @param {Array<unknown>} _args
 * @returns {void}
 */
function pseudoLog(..._args: unknown[]): void {
  const args = Array.from(_args).map((arg: unknown): unknown =>
    typeof arg === 'object' ? parseObjects(arg) : arg,
  )
  args.unshift(`${typeof _args}: `)
  log.apply(console, args)
}

/**
 * @exports logger
 * @summary an environment aware logger
 * @returns {Object}
 */
const logger: Logger = {
  /**
   * @method info
   * @summary - abstracts console.info, shows up in production build
   * @param _args @
   * @returns {void}
   */
  info: pseudoLog,

  /**
   * @method log
   * @summary - abstracts console.log, does not display in production build
   * @param _args @
   * @returns {void}
   */
  log: (..._args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'development') return
    pseudoLog(..._args)
  },
}

export default logger
