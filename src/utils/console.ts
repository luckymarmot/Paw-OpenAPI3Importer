const log = console.log

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

const logger = (..._args: unknown[]): unknown[] => {
  const args = Array.from(_args).map((arg: unknown): unknown =>
    typeof arg === 'object' ? parseObjects(arg) : arg,
  )

  args.unshift(`${typeof _args}: `)

  return log.apply(console, args)
}

export default logger
