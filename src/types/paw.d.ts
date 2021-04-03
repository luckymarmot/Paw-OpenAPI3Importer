/* eslint-disable max-classes-per-file */

declare interface RuntimeInfo {
  task: string
  isMainThread: boolean
}

declare interface DocumentInfo {
  name: string | null
  uuid: string | null
  isCloudProject: boolean
  cloudProjectId: number | null
  cloudProject: ({
    id: number | null
    currentCommitSha: string | null
    currentBranch: string | null
    mainBranch: string
    isSynced: boolean
  }) | null
  cloudTeam: ({
    id: number | null
    name: string | null
  }) | null
}

declare interface UserInfo {
  username: string | null
  email: string | null
  avatar_url: string | null
}

declare class Context {
  // @TODO definition not finished

  // Create
  createRequest(
    name?: string | null,
    method?: string | DynamicString | null,
    url?: string | DynamicString | null,
    description?: string | null
  ): Request

  createRequestGroup(name: string | null): RequestGroup

  createEnvironmentDomain(name: string | null): EnvironmentDomain

  createSecureValue(name: string | null): DynamicValue

  createJSONDynamicValue(name: string | null): DynamicValue

  // Get objects by name
  getCurrentRequest(isRequired?: boolean): Request | null

  getRequestByName(name: string): Request | null

  getRequestGroupByName(name: string): RequestGroup | null

  getEnvironmentDomainByName(name: string): EnvironmentDomain | null

  getEnvironmentVariableByName(name: string): EnvironmentVariable | null

  // Get objects by id
  getRequestById(id: string): Request | null

  getRequestGroupById(id: string): RequestGroup | null

  getEnvironmentDomainById(id: string): EnvironmentDomain | null

  getEnvironmentVariableById(id: string): EnvironmentVariable | null

  getEnvironmentById(id: string): Environment | null

  // Get root items
  getRootRequests(): Request[]

  getRootGroups(): RequestGroup[]

  getRootRequestTreeItems(): RequestTreeItem[]

  // Get all objects
  getAllRequests(): Request[]

  getAllGroups(): RequestGroup[]

  getAllRequestTreeItems(): RequestTreeItem[]

  // Get selected objects
  getSelectedRequests(): Request[]

  getSelectedGroups(): RequestGroup[]

  getSelectedRequestTreeItems(): RequestTreeItem[]

  // JSON Serialization
  stringifyJSONItems(...items: any[]): string | null

  parseJSONItems(json: string): any[] | null

  // Info
  runtimeInfo: RuntimeInfo;

  allowsMutation: boolean;

  document: DocumentInfo;

  user: UserInfo | null;
}

declare class RequestTreeItem {
  //
}

declare interface BasicAuth {
  username: string | DynamicString | null
  password: string | DynamicString | null
}

declare interface OAuth1 {
  oauth_consumer_key: string | DynamicString | null
  oauth_consumer_secret: string | DynamicString | null
  oauth_token: string | DynamicString | null
  oauth_token_secret: string | DynamicString | null
  oauth_nonce: string | DynamicString | null | undefined
  oauth_timestamp: string | DynamicString | null | undefined
  oauth_callback: string | DynamicString | null | undefined
  oauth_signature: string | DynamicString | null | undefined
  oauth_signature_method: string | null | undefined
  oauth_version: string | undefined
  oauth_additional_parameters: string | DynamicString | null | undefined
}

declare interface OAuth2 {
  client_id: string | DynamicString | null
  client_secret: string | DynamicString | null
  authorization_uri: string | DynamicString | null
  access_token_uri: string | DynamicString | null
  redirect_uri: string | DynamicString | null
  scope: string | DynamicString | null | undefined
  state: string | DynamicString | null | undefined
  token: string | DynamicString | null | undefined
  token_prefix: string | DynamicString | null | undefined
  grant_type: string | undefined
}

declare class Request extends RequestTreeItem {
  readonly id: string;

  readonly parent: RequestTreeItem | null;

  name: string;

  description: string;

  order: number;

  // URL
  url: string | DynamicString;

  getUrl(isDynamic?: boolean): string | DynamicString

  // URL Base
  readonly urlBase: string;

  getUrlBase(isDynamic?: boolean): string | DynamicString

  // URL Query
  readonly urlQuery: string;

  // URL Parameters
  urlParameters: { [key: string]: string | DynamicString };

  getUrlParameters(isDynamic?: boolean): { [key: string]: string | DynamicString }

  getUrlParametersArray(): KeyValue[]

  readonly urlParametersNames: string[];

  getUrlParametersNames(): string[]

  getUrlParameterByName(name: string, isDynamic?: boolean): string | DynamicString | null

  setUrlParameter(name: string | DynamicString, value: string | DynamicString): KeyValue

  setUrlParameterByName(name: string | DynamicString,
    value: string | DynamicString
  ): KeyValue // alias of setUrlParameter()
  addUrlParameter(name: string | DynamicString, value: string | DynamicString): KeyValue

  addRawUrlQuery(query: string | DynamicString): KeyValue

  // Method
  method: string | DynamicString;

  getMethod(isDynamic?: boolean): string | DynamicString

  // Headers
  headers: { [key: string]: string | DynamicString };

  getHeaders(isDynamic?: boolean): { [key: string]: string | DynamicString }

  readonly headersNames: string[];

  getHeadersNames(): string[]

  getHeaderByName(name: string, isDynamic?: boolean): string | DynamicString | null

  getHeadersArray(): KeyValue[]

  setHeader(name: string | DynamicString, value: string | DynamicString): KeyValue

  addHeader(name: string | DynamicString, value: string | DynamicString): KeyValue

  // Body
  body: string | DynamicString | null;

  getBody(isDynamic?: boolean): string | DynamicString | null

  // Body (URL Encoded)
  urlEncodedBody: { [key: string]: string | DynamicString } | null;

  getUrlEncodedBody(isDynamic?: boolean): { [key: string]: string | DynamicString } | null

  getUrlEncodedBodyKeys(): string[] | null

  readonly urlEncodedBodyKeys: string[] | null;

  getUrlEncodedBodyKey(key: string): string | null

  // Body (Multipart)
  multipartBody: { [key: string]: string | DynamicString } | null;

  getMultipartBody(isDynamic?: boolean): { [key: string]: string | DynamicString } | null

  // Body (JSON)
  jsonBody: object | null;

  getJsonBodyKeyPath(keyPath: string): object | null

  // Auth
  httpBasicAuth: BasicAuth | null;

  getHttpBasicAuth(isDynamic?: boolean): BasicAuth | null

  oauth1: OAuth1 | null;

  getOAuth1(isDynamic?: boolean): OAuth1 | null

  oauth2: OAuth2 | null;

  getOAuth2(isDynamic?: boolean): OAuth2 | null

  // Request Variables
  readonly variables: RequestVariable[];

  getVariablesNames(): string[]

  getVariableByName(name: string): RequestVariable | null

  getVariableById(id: string): RequestVariable | null

  addVariable(name: string, value: string | DynamicString, description: string): RequestVariable

  // Options
  timeout: number;

  followRedirects: boolean;

  redirectAuthorization: boolean;

  redirectMethod: boolean;

  sendCookies: boolean;

  storeCookies: boolean;

  clientCertificate: DynamicString | null;

  // HTTP Exchange
  getLastExchange(): HTTPExchange | null

  getAllExchanges(): HTTPExchange[]

  // Clone, delete
  clone(newName: string): Request

  deleteRequest(): boolean
}

declare class RequestGroup extends RequestTreeItem {
  readonly id: string;

  readonly parent: RequestTreeItem | null;

  name: string | null;

  order: number;
  getChildren(): RequestTreeItem[]
  getChildRequests(): Request[]
  getChildGroups(): RequestGroup[]
  appendChild(child: RequestTreeItem): void
  insertChild(child: RequestTreeItem, index: number): void
  deleteGroup(): boolean
}

declare enum KeyValueMode {
  Normal = 0,
  NormalAlwaysAddEqualSign = 1,
  Raw = 2,
}

declare class KeyValue {
  readonly id: string;

  readonly request: Request;

  readonly isHeader: boolean;

  readonly isUrlParameter: boolean;

  name: DynamicString;

  value: DynamicString;

  enabled: boolean;

  mode: KeyValueMode;
}

declare class RequestVariable {
  readonly id: string;

  readonly request: Request;

  name: string;

  value: string | DynamicString | null;

  description: string | null;

  required: boolean;

  schema: string | DynamicString | null;

  getCurrentValue(isDynamic?: boolean): string | DynamicString | null

  getSchema(isDynamic?: boolean): string | DynamicString | null

  createDynamicValue(): DynamicValue

  createDynamicString(): DynamicString
}

declare class EnvironmentDomain {
  readonly id: string;

  name: string | null;

  order: number;

  // variables
  readonly variables: EnvironmentVariable[];

  getVariableByName(name: string): EnvironmentVariable | null

  createEnvironmentVariable(name: string): EnvironmentVariable

  // environments
  readonly environments: Environment[];

  getEnvironmentByName(name: string): Environment | null

  createEnvironment(name: string): Environment
}

declare class Environment {
  readonly id: string;

  name: string | null;

  domain: EnvironmentDomain;

  order: number;

  getVariablesValues(isDynamic?: boolean): { [key: string]: string | DynamicString }

  setVariablesValues(values: { [key: string]: string | DynamicString }): void
}

declare class EnvironmentVariable {
  readonly id: string;

  name: string | null;

  domain: EnvironmentDomain;

  order: number;

  getCurrentValue(isDynamic?: boolean): string | DynamicString | null

  getValue(environment: Environment, isDynamic?: boolean): string | DynamicString | null

  setCurrentValue(value: string | DynamicString): void

  setValue(value: string | DynamicString, environment: Environment): void

  createDynamicValue(): DynamicValue

  createDynamicString(): DynamicString
}

declare class HTTPExchange {
  readonly id: string;

  readonly requestMethod: string;

  readonly requestUrl: string;

  readonly requestBody: string;

  readonly requestHeaders: { [headerName: string]: string };

  readonly requestHeaderString: string;

  readonly responseStatusCode: number;

  readonly responseStatusLine: string;

  readonly responseHeaders: { [headerName: string]: string };

  readonly responseHeaderString: string;

  readonly responseBody: string;

  readonly responseTime: number;

  readonly downloadTime: number;

  readonly date: Date;

  getRequestHeaderByName(headerName: string): string | null

  getResponseHeaderByName(headerName: string): string | null
}

declare global {
  class DynamicString {
    constructor(...components: DynamicStringComponent[])

    length: number;

    components: DynamicStringComponent[];

    getComponentAtIndex(index: number): DynamicStringComponent | null

    getSimpleString(): string

    getOnlyString(): string | null

    getOnlyDynamicValue(): DynamicValue | null

    getEvaluatedString(): string

    copy(): DynamicString

    appendString(string: string): void

    appendDynamicValue(dynamicValue: DynamicValue): void

    appendDynamicString(dynamicString: DynamicString): void
  }

  class DynamicValue {
    constructor(type: string, properties?: { [key: string]: any })

    type: string;

    getEvaluatedString(): string

    copy(): DynamicValue
  }

  class NetworkHTTPRequest {
    // @TODO definition not finished
  }
}

export interface Importer {
  canImport(context: Context, items: ExtensionItem[]): number

  import(context: Context, items: ExtensionItem[], options: ExtensionOption): boolean
}

export interface Generator {
  generate(context: Context, requests: Request[], options: ExtensionOption): string
}

export interface ExtensionImportFile {
  name: string
  path: string
}

export interface ExtensionOption {
  inputs: { [key: string]: any } | null
  file: ExtensionImportFile | null
  hideCredentials: boolean
  parent: RequestTreeItem | null
  order: number | null
}

export interface ExtensionItem {
  content: string
  name: string
  uri: string
  url: string | null
  file: ExtensionImportFile | null
  mimeType: string | null
  httpHeaders: object | null
  httpStatus: number | null
}

export type DynamicStringComponent = string | DynamicValue;

declare global {
  function registerImporter(importer: any): void;
  function registerCodeGenerator(generator: any): void;
}
