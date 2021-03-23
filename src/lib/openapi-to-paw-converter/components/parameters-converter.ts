import Paw from 'types/paw'

/**
 * @deprecated
 * OpenAPI - manual type declaraion of openapi typinggs
 * OpenAPIV3 - utilize openapi types instead
 */
import OpenAPI, { MapKeyedWithString, NonRequiredLabel } from 'types/openapi'
import { OpenAPIV3 } from 'openapi-types'
import EnvironmentManager from 'lib/environment-manager'

export default class ParametersConverter {
  private request: Paw.Request

  private readonly envManager: EnvironmentManager

  constructor(request: Paw.Request, envManager: EnvironmentManager) {
    this.request = request
    this.envManager = envManager
  }

  attachParametersFromOperationToRequest(operation: OpenAPIV3.OperationObject) {
    if (operation && operation.parameters) {
      operation.parameters.forEach((param) => {
        switch ((param as OpenAPIV3.ParameterObject).in) {
          case 'query':
            this.parseQueryParam(param as OpenAPI.ParameterObject)
            break
          case 'path':
            this.parsePathParam(param as OpenAPI.ParameterObject)
            break
          case 'header':
            this.parseHeader(param as OpenAPI.ParameterObject)
            break
          default:
          // nothing
        }
      })
    }
  }

  attachParametersFromServerVariables(
    serverVariables: MapKeyedWithString<OpenAPIV3.ServerVariableObject>,
  ) {
    Object.entries(serverVariables).forEach(([variableName, variable]) => {
      const variableValue = variable.default ?? variableName
      this.envManager.setEnvironmentVariableValue(variableName, variableValue)

      this.request.addVariable(
        variableName,
        this.envManager.getDynamicString(variableName),
        variable.description ?? '',
      )
    })
  }

  private parseQueryParam(param: OpenAPI.ParameterObject): void {
    const value = ParametersConverter.getValueFromParam(param)
    const variable = this.request.addVariable(
      param.name,
      value || '',
      param.description ??
        (param.schema as OpenAPI.SchemaObject)?.description ??
        '',
    )

    const paramValue = new DynamicString(
      new DynamicValue('com.luckymarmot.RequestVariableDynamicValue', {
        variableUUID: variable.id,
      }),
    )

    const { schema } = param
    if (schema && (schema as OpenAPIV3.SchemaObject).type) {
      variable.schema = this.convertSchema(schema as OpenAPIV3.SchemaObject)
    }

    if (!this.request.getUrlParameterByName(param.name)) {
      this.request.addUrlParameter(param.name, paramValue)
    }
  }

  private parsePathParam(param: OpenAPI.ParameterObject): void {
    let defaultValue = ParametersConverter.getValueFromParam(param)
    if (defaultValue.length == 0) {
      defaultValue = ParametersConverter.getExampleFromParam(param)
    }

    const variable = this.request.addVariable(
      param.name,
      defaultValue ?? '',
      param.description ??
        (param.schema as OpenAPIV3.SchemaObject)?.description ??
        '',
    )

    const example = ParametersConverter.getExampleFromParam(param)

    if (
      example &&
      (example as OpenAPIV3.ExampleObject).summary &&
      (example as OpenAPIV3.ExampleObject).summary === NonRequiredLabel &&
      (example as OpenAPIV3.ExampleObject).value === true
    ) {
      variable.required = false
    }

    // // convert schema
    const { schema } = param
    if (schema && (schema as OpenAPIV3.SchemaObject).type) {
      variable.schema = this.convertSchema(schema as OpenAPIV3.SchemaObject)
    }
  }

  private parseHeader(param: OpenAPI.ParameterObject): void {
    const value = ParametersConverter.getValueFromParam(param)
    const variable = this.request.addVariable(
      param.name,
      value ?? '',
      param.description ??
        (param.schema as OpenAPI.SchemaObject)?.description ??
        '',
    )

    const headerValue = new DynamicString(
      new DynamicValue('com.luckymarmot.RequestVariableDynamicValue', {
        variableUUID: variable.id,
      }),
    )

    const { schema } = param
    if (schema && (schema as OpenAPIV3.SchemaObject).type) {
      variable.schema = this.convertSchema(schema as OpenAPIV3.SchemaObject)
    }

    if (!this.request.getHeaderByName(param.name)) {
      this.request.addHeader(
        (param as OpenAPI.ParameterObject).name,
        headerValue,
      )
    }
  }

  static getValueFromParam(param: OpenAPI.ParameterObject): string {
    let value: string = ''
    const { schema = null } = param as OpenAPI.ParameterObject
    if (schema && (schema as OpenAPI.SchemaObject).default) {
      value = (schema as OpenAPI.SchemaObject).default
    }

    return value
  }

  static getExampleFromParam(param: OpenAPI.ParameterObject): string {
    const { example = null } = param as OpenAPI.ParameterObject

    return example
  }

  // eslint-disable-next-line class-methods-use-this
  private convertSchema(schema: OpenAPIV3.SchemaObject): string {
    // Schema
    // https://swagger.io/specification/#schema-object
    // The following properties are taken directly from the JSON Schema definition
    // and follow the same specifications: [...]
    // Keep only the properties that are compatible with the JSON Schema spec.
    const pawSchema: Partial<OpenAPIV3.SchemaObject> = {
      ...(schema.title ? { title: schema.title } : {}),
      ...(schema.multipleOf ? { multipleOf: schema.multipleOf } : {}),
      ...(schema.maximum ? { maximum: schema.maximum } : {}),
      ...(schema.exclusiveMaximum
        ? { exclusiveMaximum: schema.exclusiveMaximum }
        : {}),
      ...(schema.minimum ? { minimum: schema.minimum } : {}),
      ...(schema.exclusiveMinimum
        ? { exclusiveMinimum: schema.exclusiveMinimum }
        : {}),
      ...(schema.maxLength ? { maxLength: schema.maxLength } : {}),
      ...(schema.minLength ? { minLength: schema.minLength } : {}),
      ...(schema.pattern ? { pattern: schema.pattern } : {}),
      ...(schema.maxItems ? { maxItems: schema.maxItems } : {}),
      ...(schema.minItems ? { minItems: schema.minItems } : {}),
      ...(schema.uniqueItems ? { uniqueItems: schema.uniqueItems } : {}),
      ...(schema.maxProperties ? { maxProperties: schema.maxProperties } : {}),
      ...(schema.minProperties ? { minProperties: schema.minProperties } : {}),
      ...(schema.required ? { required: schema.required } : {}),
      ...(schema.enum ? { enum: schema.enum } : {}),
    }
    if (Object.keys(pawSchema).length === 0) {
      return ''
    }
    return JSON.stringify(pawSchema, null, 2)
  }
}
