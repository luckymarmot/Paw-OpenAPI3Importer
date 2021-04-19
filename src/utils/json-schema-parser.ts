import { OpenAPIV3 } from 'openapi-types'

// The JSON Object that defines the default values of certain types.
type typesInstantiatorType =
  | 'string'
  | 'number'
  | 'integer'
  | 'null'
  | 'boolean'
  | 'object'
  | 'array'

type JSPOptions = {
  requiredPropertiesOnly: boolean
}

const typesInstantiator = {
  string: '',
  number: 0,
  integer: 0,
  null: null,
  boolean: false, // Always stay positive? lol
  object: {},
  array: [],
}

/**
 * Checks whether a letiable is a primitive.
 * @param obj - an object.
 * @returns {boolean}
 */
function isPrimitive(obj: OpenAPIV3.SchemaObject) {
  let type = obj.type as typesInstantiatorType
  return typesInstantiator[type] !== undefined
}

/**
 * Checks whether a property is on required array.
 * @param property - the property to check.
 * @param requiredArray - the required array
 * @returns {boolean}
 */
function isPropertyRequired(property: string, requiredArray: any[] | any) {
  let found = false
  requiredArray = requiredArray || []
  requiredArray.forEach(function (requiredProperty: string) {
    if (requiredProperty === property) {
      found = true
    }
  })
  return found
}

function shouldVisit(
  property: any,
  obj: OpenAPIV3.SchemaObject,
  options: JSPOptions,
) {
  return (
    !options.requiredPropertiesOnly ||
    (options.requiredPropertiesOnly &&
      isPropertyRequired(property, obj.required))
  )
}

/**
 * Instantiate a primitive.
 * @param val - The object that represents the primitive.
 * @returns {*}
 */
function instantiatePrimitive(val: OpenAPIV3.SchemaObject): any {
  let type = val.type

  // Support for default values in the JSON Schema.
  if (val.hasOwnProperty('example')) {
    return val.example
  }

  return typesInstantiator[type as typesInstantiatorType]
}

/**
 * Checks whether a letiable is an enum.
 * @param obj - an object.
 * @returns {boolean}
 */
function isEnum(obj: any): boolean {
  return Object.prototype.toString.call(obj.enum) === '[object Array]'
}

/**
 * Checks whether a letiable is an array.
 * @param obj - an object.
 * @returns {boolean}
 */
function isArray(obj: any): boolean {
  return Array.isArray(obj)
}

/**
 * Extracts the type of the object.
 * If the type is an array, set type to first in list of types.
 * If obj.type is not overridden, it will fail the isPrimitive check.
 * Which internally also checks obj.type.
 * @param obj - An object.
 */
function getObjectType(obj: any): typesInstantiatorType {
  // Check if type is array of types.
  if (isArray(obj.type)) {
    obj.type = obj.type[0]
  }

  return obj.type
}

/**
 * Instantiate an enum.
 * @param val - The object that represents the primitive.
 * @returns {*}
 */
function instantiateEnum(val: any) {
  // Support for default values in the JSON Schema.
  if (val.default) {
    return val.default
  }

  if (!val.enum.length) {
    return undefined
  }
  return val.enum[0]
}

/**
 * Finds a definition in a schema.
 * Useful for finding references.
 *
 * @param schema    The full schema object.
 * @param ref       The reference to find.
 * @return {*}      The object representing the ref.
 */
function findDefinition(schema: any, ref: string) {
  let propertyPath = ref.split('/').slice(1) // Ignore the #/uri at the beginning.
  let currentProperty = propertyPath.splice(0, 1)[0]

  let currentValue = schema

  while (currentProperty) {
    currentValue = currentValue[currentProperty]
    currentProperty = propertyPath.splice(0, 1)[0]
  }

  return currentValue
}

/**
 * The main function.
 * Calls sub-objects recursively, depth first, using the sub-function 'visit'.
 * @param schema - The schema to instantiate.
 * @returns {*}
 */
function jsonSchemaParser(
  schema: OpenAPIV3.SchemaObject,
  options: any = {},
): any {
  options = options || {}

  /**
   * Visits each sub-object using recursion.
   * If it reaches a primitive, instantiate it.
   * @param obj - The object that represents the schema.
   * @param name - The name of the current object.
   * @param data - The instance data that represents the current object.
   */
  function visit(
    obj: OpenAPIV3.SchemaObject | any,
    name: string | number,
    data: any,
  ): any {
    if (!obj) {
      return
    }

    let i
    let type = getObjectType(obj)

    // We want non-primitives objects (primitive === object w/o properties).
    if (type === 'object' && obj.properties) {
      data[name] = data[name] || {}

      // Visit each property.
      for (let property in obj.properties) {
        if (obj.properties.hasOwnProperty(property)) {
          if (shouldVisit(property, obj, options)) {
            visit(obj.properties[property], property, data[name])
          }
        }
      }
    } else if (obj.allOf) {
      for (i = 0; i < obj.allOf.length; i++) {
        visit(obj.allOf[i], name, data)
      }
    } else if (obj.$ref) {
      obj = findDefinition(schema, obj.$ref)
      visit(obj, name, data)
    } else if (type === 'array') {
      data[name] = []
      let len = 0
      if (obj.minItems || obj.minItems > 0) {
        len = obj.minItems
      }

      // Instantiate 'len' items.
      for (i = 0; i < len; i++) {
        visit(obj.items, i, data[name])
      }
    } else if (isEnum(obj)) {
      data[name] = instantiateEnum(obj)
    } else if (isPrimitive(obj)) {
      data[name] = instantiatePrimitive(obj)
    }
  }

  let data = { props: {} }
  visit(schema, 'props', data)
  return data['props'] as any
}

export default jsonSchemaParser
