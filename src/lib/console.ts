export default class Console {
  static parseArgs(args: any[]): any[] {
    return args.map((arg) => {
      if (Array.isArray(arg)) {
        return `Array: [${arg}]`;
      } if (typeof arg === 'object') {
        return `Object: ${Console.stringifyWithCyclicSupport(arg)}`;
      }
      return arg;
    });
  }

  static stringifyWithCyclicSupport(object: object) {
    const seen: any[] = [];

    return JSON.stringify(object, (key, val) => {
      if (val != null && typeof val === 'object') {
        if (seen.indexOf(val) < 0) {
          seen.push(val);
        }
      }

      return val;
    }, 2);
  }

  static log(...args: any[]) {
    // eslint-disable-next-line no-console
    console.log(...Console.parseArgs(args));
  }

  static error(...args: any[]) {
    // eslint-disable-next-line no-console
    console.error(...Console.parseArgs(args));
  }
}
