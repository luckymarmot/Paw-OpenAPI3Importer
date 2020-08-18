# OpenAPI 3.0 Importer for Paw

A [Paw Extension](https://paw.cloud/extensions) to import OpenAPI files (json or yaml) to Paw.

## How to use?

1. In Paw, go to File menu, then Import OpenAPI 3.0
2. Pick the saved OpenAPI file, and make sure the Format is "OpenAPI 3.0 Importer"

#Development
1. `npm run watch` to live reload + upload extension to Paw
2. In Paw -> "Window" -> "Extension console" is the console where You have access to debugging console
3. To use `console.log` and `console.error` function it is recommended to use `Console` class from `src/lib`. Standard console.log outputs object as `[object Object]` while `Console.log` will  output stringified version of object

## License

This Paw Extension is released under the MIT License. Feel free to fork, and modify!

Copyright © 2014-2019 [Paw](https://paw.cloud)
