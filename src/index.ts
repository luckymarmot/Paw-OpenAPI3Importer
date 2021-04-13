import { OpenAPIv3Importer } from './lib'

// add Promise to the global scope
import Promise from 'promise'
global.Promise = Promise as any

// Fix missing location since we're not in a web browser
global.location = {
    href: '',
} as any

registerImporter(OpenAPIv3Importer)
