/* eslint-disable max-classes-per-file */

/**
 * Helper types
 */
export type MapKeyedWithString<T> = {[key: string] : T}
export const NonRequiredLabel = 'NonRequired'
export const BasicCredentialsLabel = 'Basic credentials'

/**
 * OpenAPI format
 *
 * Schemas
 * https://swagger.io/specification/#schema
 */


/**
 * Main object
 */
export interface OpenAPIObject {
    openapi: string
    info: InfoObject
    servers?: ServerObject[]
    paths: PathsObject
    components?: ComponentsObject
    security?: SecurityRequirementObject[]
    tags?: TagObject[]
    externalDocs?: ExternalDocumentationObject
}


/**
 * OpenAPI component objects
 */
export interface InfoObject {
    title: string
    description?: string
    termsOfService?: string
    contact?: ContactObject
    license?: LicenseObject
    version?: string
}

export interface ContactObject {
    name?: string
    url?: string
    email?: string
}

export interface LicenseObject {
    name: string
    url?: string
}

export interface ServerObject {
    url: string
    description?: string
    variables?: MapKeyedWithString<ServerVariableObject>
}

export interface ServerVariableObject {
    enum?: string[]
    default: string
    description?: string
}

export interface ComponentsObject {
    schemas?: MapKeyedWithString<(SchemaObject | ReferenceObject)>
    responses?: MapKeyedWithString<(ResponseObject | ReferenceObject)>
    parameters?: MapKeyedWithString<(ParameterObject | ReferenceObject)>
    examples?: MapKeyedWithString<(ExampleObject | ReferenceObject)>
    requestBodies?: MapKeyedWithString<(RequestBodyObject | ReferenceObject)>
    headers?: MapKeyedWithString<(HeaderObject | ReferenceObject)>
    securitySchemes?: MapKeyedWithString<(SecuritySchemeObject | ReferenceObject)>
    links?: MapKeyedWithString<(LinkObject | ReferenceObject)>
    callbacks?: MapKeyedWithString<(CallbackObject | ReferenceObject)>
}

export interface PathsObject {
    [path: string]: PathItemObject //must starts with "/" => needs some validation to this
}

export interface PathItemObject {
    $ref?: string
    summary?: string
    description?: string
    get?: OperationObject
    put?: OperationObject
    post?: OperationObject
    delete?: OperationObject
    options?: OperationObject
    head?: OperationObject
    patch?: OperationObject
    trace?: OperationObject
    servers?: ServerObject[]
    parameters?: (ParameterObject[] | ReferenceObject[])
}

export interface OperationObject {
    tags?: string[]
    summary?: string
    description?: string
    externalDocs?: ExternalDocumentationObject
    operationId?: string
    parameters?: (ParameterObject | ReferenceObject)[]
    requestBody?: (RequestBodyObject | ReferenceObject)
    responses: ResponsesObject
    callbacks?: MapKeyedWithString<(CallbackObject | ReferenceObject)>
    deprecated?: boolean
    security?: SecurityRequirementObject[]
    servers?: ServerObject[]
}

export interface ExternalDocumentationObject {
    description?: string
    url: string
}

export interface ParameterObject {
    name: string
    in: "query" | "header" | "path" | "cookie"
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "depObject"
    explode?: boolean
    allowReserved?: boolean
    schema?: SchemaObject | ReferenceObject
    example?: any
    examples?: MapKeyedWithString<(ExampleObject | ReferenceObject)>
    content?: MapKeyedWithString<MediaTypeObject>
}

export interface RequestBodyObject {
    description?: string
    content: MapKeyedWithString<MediaTypeObject>
    required?: boolean
}

export interface MediaTypeObject {
    schema?: SchemaObject | ReferenceObject
    example?: any
    examples?: MapKeyedWithString<(ExampleObject | ReferenceObject)>
    encoding?: MapKeyedWithString<EncodingObject>
}

export interface EncodingObject {
    contentType?: string
    headers?: MapKeyedWithString<(HeaderObject | ReferenceObject)>
    style?: string
    explode?: boolean
    allowReserved?: boolean
}

export interface ResponsesObject {
    [status: string]: ResponseObject | ReferenceObject //keys needs validation => "default" or http code or http code range as "2xx"
}

export interface ResponseObject {
    description: string | null
    headers: MapKeyedWithString<(HeaderObject | ReferenceObject)> | null
    content: MapKeyedWithString<MediaTypeObject> | null
    links: MapKeyedWithString<(LinkObject | ReferenceObject)> | null
}

export interface CallbackObject {
    [callback: string]: PathItemObject
}

export interface ExampleObject {
    summary?: string
    description?: string
    value?: any
    externalValue?: string
}

export interface LinkObject {
    operationRef: string | null
    operationId: string | null
    parameters: MapKeyedWithString<any> | null
    requestBody: any | string | null
    description: string | null
    server: ServerObject | null
}

export interface HeaderObject {
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: "simple"
    explode?: boolean
    allowReserved?: boolean
    schema?: SchemaObject | ReferenceObject
    example?: any
    examples?: MapKeyedWithString<(ExampleObject | ReferenceObject)>
    content?: MapKeyedWithString<MediaTypeObject>
}

export interface TagObject {
    name: string
    description?: string
    externalDocs?: ExternalDocumentationObject
}

export interface ReferenceObject {
    $ref: string
}

export interface SchemaObject {
    title?: string
    multipleOf?: number
    maximum?: number
    exclusiveMaximum?: number
    minimum?: number
    exclusiveMinimum?: number
    maxLength?: number
    minLength?: number
    pattern?: string // valid regular expression
    maxItems?: number
    minItems?: number
    uniqueItems?: number
    maxProperties?: number
    minProperties?: number
    required?: boolean
    enum?: string[]

    type?: string
    allOf?: (SchemaObject | ReferenceObject)[]
    oneOf?: ( SchemaObject | ReferenceObject)[]
    anyOf?: ( SchemaObject | ReferenceObject)[]
    not?: ( SchemaObject | ReferenceObject)[]
    items?:  SchemaObject | ReferenceObject
    properties?: MapKeyedWithString<(SchemaObject | ReferenceObject)>
    additionalProperties?: boolean |  SchemaObject | ReferenceObject
    description?: string
    format?: string
    default?: any

    nullable?: boolean
    discriminator?: DiscriminatorObject
    readOnly?: boolean
    writeOnly?: boolean
    xml?: XMLObject
    externalDocs?: ExternalDocumentationObject
    example?: any
    deprecated?: boolean
}

export interface DiscriminatorObject {
    propertyName: string
    mapping?: MapKeyedWithString<string>
}

export interface XMLObject {
    name?: string
    namespace?: string
    prefix?: string
    attribute?: boolean
    wrapped?: boolean
}

export type SecuritySchemeObject = {
    type: "apiKey"
    description?: string
    name: string
    in: "query" | "header" | "cookie"
} | {
    type: "http"
    description?: string
    scheme: 'basic' | 'bearer' | string
    bearerFormat?: string
} | {
    type: "oauth2"
    description?: string
    flows: OAuthFlowsObject
} | {
    type: "openIdConnect"
    description?: string
    openIdConnectUrl: string
}

export interface OAuthFlowsObject {
    implicit?: OAuthFlowObject
    password?: OAuthFlowObject
    clientCredentials?: OAuthFlowObject
    authorizationCode?: OAuthFlowObject
}

export interface OAuthFlowObject {
    authorizationUrl: string
    tokenUrl: string
    refreshUrl?: string
    scopes: MapKeyedWithString<string>
}

export interface SecurityRequirementObject {
    [name: string]: string[]
}
