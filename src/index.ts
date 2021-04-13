import { OpenAPIv3Importer } from './lib'

// add Promise to the global scope
import Promise from 'promise'
global.Promise = Promise as any

registerImporter(OpenAPIv3Importer)
