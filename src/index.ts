import { OpenAPIv3Importer } from './lib'

// add Promise to the global scope
// Note: we've tried with many Babel polyfills but it just causes
// bugs when the script is loaded.
import Promise from 'promise'
global.Promise = Promise as any

// Swagger Importer relies on `window.location`.
// But since we're not in a web browser, it isn't available.
// `global` here would be an alias to `window`, so we make this hack
// to allow Swagger Importer to work.
global.location = {
    href: '',
} as any

registerImporter(OpenAPIv3Importer)
