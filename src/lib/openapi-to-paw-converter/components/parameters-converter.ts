// eslint-disable-next-line import/extensions
import Paw from '../../../types-paw-api/paw';
// eslint-disable-next-line import/extensions
import OpenAPI, { NonRequiredLabel } from '../../../types-paw-api/openapi';

export default class ParametersConverter {
  private request: Paw.Request;

  constructor(request: Paw.Request) {
    this.request = request;
  }

  attachParametersFromOperationToRequest(operation: OpenAPI.OperationObject) {
    if (operation && operation.parameters) {
      operation.parameters.forEach((param) => {
        switch ((param as OpenAPI.ParameterObject).in) {
          case 'query':
            this.parseQueryParam(param as OpenAPI.ParameterObject);
            break;
          case 'path':
            this.parsePathParam(param as OpenAPI.ParameterObject);
            break;
          case 'header':
            this.parseHeader(param as OpenAPI.ParameterObject);
            break;
          case 'cookie':
            this.parseCookie(param as OpenAPI.ParameterObject);
            break;
          default:
            // nothing
        }
      });
    }
  }

  parseCookie(param: OpenAPI.ParameterObject): void {
    let cookies = this.request.getHeaderByName('cookie');

    if (!cookies) {
      cookies = '';
    }

    cookies += `${(param as OpenAPI.ParameterObject).name}=${ParametersConverter.getValueFromParam(param)}; `;

    this.request.addHeader('cookie', cookies);
  }

  private parseQueryParam(param: OpenAPI.ParameterObject): void {
    const variable = this.request.addVariable(
      param.name,
      ParametersConverter.getValueFromParam(param),
      param.description ?? '',
    );

    // convert schema
    const schema = param.schema
    if (schema && (schema as OpenAPI.SchemaObject).type) {
      variable.schema = this.convertSchema(schema as OpenAPI.SchemaObject)
    }

    // add URL query parameter
    this.request.addUrlParameter(
      param.name,
      variable.createDynamicString(),
    );
  }

  private parsePathParam(param: OpenAPI.ParameterObject): void {
    const variable = this.request.addVariable(
      param.name,
      ParametersConverter.getValueFromParam(param),
      param.description ?? ''
    );
    const example = ParametersConverter.getExampleFromParam(param);

    if (
      example
      && (example as OpenAPI.ExampleObject).summary
      && (example as OpenAPI.ExampleObject).summary === NonRequiredLabel
      && (example as OpenAPI.ExampleObject).value === true
    ) {
      variable.required = false;
    }
  }

  private parseHeader(param: OpenAPI.ParameterObject): void {
    this.request.addHeader(
      (param as OpenAPI.ParameterObject).name,
      ParametersConverter.getValueFromParam(param),
    );
  }

  static getValueFromParam(param: OpenAPI.ParameterObject): string {
    let value: string = '';
    const { schema = null } = (param as OpenAPI.ParameterObject);
    if (schema && (schema as OpenAPI.SchemaObject).default) {
      value = (schema as OpenAPI.SchemaObject).default;
    }

    return value;
  }

  static getExampleFromParam(param: OpenAPI.ParameterObject): string {
    const { example = null } = (param as OpenAPI.ParameterObject);

    return example;
  }

  private convertSchema(schema: OpenAPI.SchemaObject): string {
    // Schema
    // https://swagger.io/specification/#schema-object
    // The following properties are taken directly from the JSON Schema definition and follow the same specifications: [...]
    // Keep only the properties that are compatible with the JSON Schema spec.
    const pawSchema: Partial<OpenAPI.SchemaObject> = {
      ...(schema.title ? { title: schema.title } : {}),
      ...(schema.multipleOf ? { multipleOf: schema.multipleOf } : {}),
      ...(schema.maximum ? { maximum: schema.maximum } : {}),
      ...(schema.exclusiveMaximum ? { exclusiveMaximum: schema.exclusiveMaximum } : {}),
      ...(schema.minimum ? { minimum: schema.minimum } : {}),
      ...(schema.exclusiveMinimum ? { exclusiveMinimum: schema.exclusiveMinimum } : {}),
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
