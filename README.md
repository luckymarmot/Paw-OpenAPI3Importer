# OpenAPI 3.0 Importer for Paw

A [Paw Extension](https://paw.cloud/extensions) to import OpenAPI files (json or yaml) to Paw.

## How to use?

1. In Paw, go to File menu, then Import OpenAPI 3.0
2. Pick the saved OpenAPI file, and make sure the Format is "OpenAPI 3.0 Importer"

### Development

Install packages and dependencies with `npm install` or `yarn`

**Build**

- build for production: `npm run build:mac` or `yarn build:mac`
- build and install extension: `npm run dev:mac:static` or `yarn dev:mac:static`

**Live Reload**

`npm run dev:mac` or `yarn dev:mac` installs the extension and automatically
updates+reloads on save.

**Debugging** You may access Paw Extensions console through the shortcut:

<kbd>&#8984; CMD</kbd> + <kbd>alt</kbd> + <kbd>3</kbd>

To output information to console you may utilize `logger.[log|info]`. Standard `console`
outputs objects and arrays as `[object Object]`

## License

Copyright 2014-2021 © [Paw](https://paw.cloud)

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
