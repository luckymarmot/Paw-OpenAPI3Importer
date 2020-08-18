export default class Console {
  static parseArgs(args: any[]): any[] {
    return args.map(arg => {
      if (Array.isArray(arg)) {
        return `Array: [${arg}]`
      } else if (typeof arg === 'object') {
        return `Object: ${Console.stringifyWithCyclicSupport(arg)}`
      } else {
        return arg
      }
    })
  }

  static stringifyWithCyclicSupport(object: object) {
    const seen: any[] = [];

    return JSON.stringify(object, (key, val) => {
      if (val != null && typeof val == "object") {
        if (seen.indexOf(val) >= 0) {
          return;
        }
        seen.push(val);
      }
      return val;
    }, 2)
  }

  static log(...args: any[]) {
    console.log(...Console.parseArgs(args));
  }

  static error(...args: any[]) {
    console.error(...Console.parseArgs(args));
  }
}
