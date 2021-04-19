declare module 'json-schema-instantiator'

declare global {
  function registerImporter(importer: any): void
  function registerCodeGenerator(generator: any): void

  interface Logger {
    log: (..._args: unknown[]) => void
    info: (..._args: unknown[]) => void
  }

  type MapKeyedWithString<T> = { [key: string]: T }
  type GroupedRequestType = { group: string; path: string }
  type CreateRequestGroupType = {
    group: string
    paths: string[]
  }
  type TransformStringType = {
    defaultValue: string
    envManager: EnvironmentManager
    stringInput: string
    requestInput: Paw.Request
  }

  type DynamicStringComponent = string | DynamicValue
  class DynamicString {
    length: number
    components: DynamicStringComponent[]
    constructor(...components: DynamicStringComponent[])
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
    public type: string
    constructor(type: string, properties?: { [key: string]: any })
    getEvaluatedString(): string
    copy(): DynamicValue
  }

  class NetworkHTTPRequest {}

  class BasicAuth {
    username: string | DynamicString | null
    password: string | DynamicString | null
  }

  class OAuth1 {
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

  class OAuth2 {
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
}

declare namespace Paw {
  interface RuntimeInfo {
    task: string
    isMainThread: boolean
  }

  interface DocumentInfo {
    name: string | null
    uuid: string | null
    isCloudProject: boolean
    cloudProjectId: number | null
    cloudProject: {
      id: number | null
      currentCommitSha: string | null
      currentBranch: string | null
      mainBranch: string
      isSynced: boolean
    } | null
    cloudTeam: {
      id: number | null
      name: string | null
    } | null
  }

  interface UserInfo {
    username: string | null
    email: string | null
    avatar_url: string | null
  }

  class Context {
    runtimeInfo: RuntimeInfo
    allowsMutation: boolean
    document: DocumentInfo
    user: UserInfo | null
    createRequest(
      name?: string | null,
      method?: string | DynamicString | null,
      url?: string | DynamicString | null,
      description?: string | null,
      order?: number,
    ): Request
    createRequestGroup(name: string | null): RequestGroup
    createEnvironmentDomain(name: string | null): EnvironmentDomain
    createSecureValue(name: string | null): DynamicValue
    createJSONDynamicValue(name: string | null): DynamicValue
    getCurrentRequest(isRequired?: boolean): Request | null
    getRequestByName(name: string): Request | null
    getRequestGroupByName(name: string): RequestGroup | null
    getEnvironmentDomainByName(name: string): EnvironmentDomain | null
    getEnvironmentVariableByName(name: string): EnvironmentVariable | null
    getRequestById(id: string): Request | null
    getRequestGroupById(id: string): RequestGroup | null
    getEnvironmentDomainById(id: string): EnvironmentDomain | null
    getEnvironmentVariableById(id: string): EnvironmentVariable | null
    getEnvironmentById(id: string): Environment | null
    getRootRequests(): Request[]
    getRootGroups(): RequestGroup[]
    getRootRequestTreeItems(): RequestTreeItem[]
    getAllRequests(): Request[]
    getAllGroups(): RequestGroup[]
    getAllRequestTreeItems(): RequestTreeItem[]
    getSelectedRequests(): Request[]
    getSelectedGroups(): RequestGroup[]
    getSelectedRequestTreeItems(): RequestTreeItem[]
    stringifyJSONItems(...items: any[]): string | null
    parseJSONItems(json: string): any[] | null
  }

  class RequestTreeItem {
    readonly id: string
    readonly parent: RequestTreeItem | null
    readonly urlBase: string
    readonly urlQuery: string
    readonly urlParametersNames: string[]
    readonly urlEncodedBodyKeys: string[] | null
    readonly headersNames: string[]
    readonly variables: RequestVariable[]
    name: string
    description: string
    order: number
    url: string | DynamicString
    urlParameters: { [key: string]: string | DynamicString }
    method: string | DynamicString
    headers: { [key: string]: string | DynamicString }
    body: string | DynamicString | null
    urlEncodedBody: { [key: string]: string | DynamicString } | null
    multipartBody: { [key: string]: string | DynamicString } | null
    jsonBody: object | null
    httpBasicAuth: BasicAuth | null
    oauth1: OAuth1 | null
    oauth2: OAuth2 | null
    timeout: number
    followRedirects: boolean
    redirectAuthorization: boolean
    redirectMethod: boolean
    sendCookies: boolean
    storeCookies: boolean
    clientCertificate: DynamicString | null

    getUrl(isDynamic?: boolean): string | DynamicString
    getUrlBase(isDynamic?: boolean): string | DynamicString
    getUrlParametersArray(): KeyValue[]
    getUrlParametersNames(): string[]

    getUrlParameters(
      isDynamic?: boolean,
    ): { [key: string]: string | DynamicString }

    getUrlParameterByName(
      name: string,
      isDynamic?: boolean,
    ): string | DynamicString | null

    setUrlParameter(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue

    setUrlParameterByName(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue // alias of setUrlParameter()
    addUrlParameter(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue
    addRawUrlQuery(query: string | DynamicString): KeyValue
    getMethod(isDynamic?: boolean): string | DynamicString
    getHeaders(isDynamic?: boolean): { [key: string]: string | DynamicString }
    getHeadersNames(): string[]
    getHeaderByName(
      name: string,
      isDynamic?: boolean,
    ): string | DynamicString | null
    getHeadersArray(): KeyValue[]
    setHeader(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue
    addHeader(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue
    getBody(isDynamic?: boolean): string | DynamicString | null
    getUrlEncodedBody(
      isDynamic?: boolean,
    ): { [key: string]: string | DynamicString } | null
    getUrlEncodedBodyKeys(): string[] | null
    getUrlEncodedBodyKey(key: string): string | null
    getMultipartBody(
      isDynamic?: boolean,
    ): { [key: string]: string | DynamicString } | null
    getJsonBodyKeyPath(keyPath: string): object | null
    getHttpBasicAuth(isDynamic?: boolean): BasicAuth | null
    getOAuth1(isDynamic?: boolean): OAuth1 | null
    getOAuth2(isDynamic?: boolean): OAuth2 | null
    getVariablesNames(): string[]
    getVariableByName(name: string): RequestVariable | null
    getVariableById(id: string): RequestVariable | null
    addVariable(
      name: string,
      value: string | DynamicString,
      description: string,
    ): RequestVariable
    getLastExchange(): HTTPExchange | null
    getAllExchanges(): HTTPExchange[]
    clone(newName: string): Request
    deleteRequest(): boolean
  }

  enum KeyValueMode {
    Normal = 0,
    NormalAlwaysAddEqualSign = 1,
    Raw = 2,
  }

  class KeyValue {
    readonly id: string
    readonly request: Request
    readonly isHeader: boolean
    readonly isUrlParameter: boolean
    name: DynamicString
    value: DynamicString
    enabled: boolean
    mode: KeyValueMode
  }

  class Request extends RequestTreeItem {
    readonly id: string
    readonly parent: RequestTreeItem | null
    readonly urlBase: string
    readonly urlQuery: string
    readonly urlParametersNames: string[]
    readonly headersNames: string[]
    readonly urlEncodedBodyKeys: string[] | null
    readonly variables: RequestVariable[]
    name: string
    description: string
    order: number
    url: string | DynamicString
    timeout: number
    followRedirects: boolean
    redirectAuthorization: boolean
    redirectMethod: boolean
    sendCookies: boolean
    storeCookies: boolean
    clientCertificate: DynamicString | null
    urlParameters: { [key: string]: string | DynamicString }
    method: string | DynamicString
    headers: { [key: string]: string | DynamicString }
    body: string | DynamicString | null
    urlEncodedBody: { [key: string]: string | DynamicString } | null
    multipartBody: { [key: string]: string | DynamicString } | null
    jsonBody: object | null
    httpBasicAuth: BasicAuth | null
    oauth1: OAuth1 | null
    oauth2: OAuth2 | null

    getUrl(isDynamic?: boolean): string | DynamicString
    getUrlBase(isDynamic?: boolean): string | DynamicString

    getUrlParameters(
      isDynamic?: boolean,
    ): { [key: string]: string | DynamicString }

    getUrlParametersArray(): KeyValue[]
    getUrlParametersNames(): string[]
    getUrlParameterByName(
      name: string,
      isDynamic?: boolean,
    ): string | DynamicString | null

    setUrlParameter(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue

    setUrlParameterByName(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue // alias of setUrlParameter()

    addUrlParameter(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue

    addRawUrlQuery(query: string | DynamicString): KeyValue
    getMethod(isDynamic?: boolean): string | DynamicString
    getHeaders(isDynamic?: boolean): { [key: string]: string | DynamicString }
    getHeadersNames(): string[]
    getHeadersArray(): KeyValue[]

    getHeaderByName(
      name: string,
      isDynamic?: boolean,
    ): string | DynamicString | null

    setHeader(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue

    addHeader(
      name: string | DynamicString,
      value: string | DynamicString,
    ): KeyValue

    getBody(isDynamic?: boolean): string | DynamicString | null
    getUrlEncodedBodyKeys(): string[] | null
    getUrlEncodedBodyKey(key: string): string | null

    getUrlEncodedBody(
      isDynamic?: boolean,
    ): { [key: string]: string | DynamicString } | null

    getMultipartBody(
      isDynamic?: boolean,
    ): { [key: string]: string | DynamicString } | null

    getJsonBodyKeyPath(keyPath: string): object | null
    getHttpBasicAuth(isDynamic?: boolean): BasicAuth | null
    getOAuth1(isDynamic?: boolean): OAuth1 | null
    getOAuth2(isDynamic?: boolean): OAuth2 | null
    getVariablesNames(): string[]
    getVariableByName(name: string): RequestVariable | null
    getVariableById(id: string): RequestVariable | null

    addVariable(
      name: string,
      value: string | DynamicString,
      description: string,
    ): RequestVariable

    getLastExchange(): HTTPExchange | null
    getAllExchanges(): HTTPExchange[]
    clone(newName: string): Request
    deleteRequest(): boolean
  }

  class RequestGroup extends RequestTreeItem {
    readonly id: string
    readonly parent: RequestTreeItem | null
    order: number
    getChildren(): RequestTreeItem[]
    getChildRequests(): Request[]
    getChildGroups(): RequestGroup[]
    appendChild(child: RequestTreeItem): void
    insertChild(child: RequestTreeItem, index: number): void
    deleteGroup(): boolean
  }

  class RequestVariable {
    readonly id: string
    readonly request: Request
    name: string
    value: string | DynamicString | null
    description: string | null
    required: boolean
    schema: string | DynamicString | null
    getCurrentValue(isDynamic?: boolean): string | DynamicString | null
    getSchema(isDynamic?: boolean): string | DynamicString | null
    createDynamicValue(): DynamicValue
    createDynamicString(): DynamicString
  }

  class EnvironmentDomain {
    readonly id: string
    readonly variables: EnvironmentVariable[]
    readonly environments: Environment[]
    name: string | null
    order: number
    getVariableByName(name: string): EnvironmentVariable | null
    createEnvironmentVariable(name: string): EnvironmentVariable
    getEnvironmentByName(name: string): Environment | null
    createEnvironment(name: string): Environment
  }

  class Environment {
    readonly id: string
    name: string | null
    domain: EnvironmentDomain
    order: number
    getVariablesValues(
      isDynamic?: boolean,
    ): { [key: string]: string | DynamicString }
    setVariablesValues(values: { [key: string]: string | DynamicString }): void
  }

  class EnvironmentVariable {
    readonly id: string
    name: string | null
    domain: EnvironmentDomain
    order: number
    getCurrentValue(isDynamic?: boolean): string | DynamicString | null
    getValue(
      environment: Environment,
      isDynamic?: boolean,
    ): string | DynamicString | null
    setCurrentValue(value: string | DynamicString): void
    setValue(value: string | DynamicString, environment: Environment): void
    createDynamicValue(): DynamicValue
    createDynamicString(): DynamicString
  }

  class HTTPExchange {
    readonly id: string
    readonly requestMethod: string
    readonly requestUrl: string
    readonly requestBody: string
    readonly requestHeaders: { [headerName: string]: string }
    readonly requestHeaderString: string
    readonly responseStatusCode: number
    readonly responseStatusLine: string
    readonly responseHeaders: { [headerName: string]: string }
    readonly responseHeaderString: string
    readonly responseBody: string
    readonly responseTime: number
    readonly downloadTime: number
    readonly date: Date
    getRequestHeaderByName(headerName: string): string | null
    getResponseHeaderByName(headerName: string): string | null
  }

  interface ExtensionProperties {
    identifier: string
    title: string
    fileExtension?: string[]
    languageHighlighter?: string
    inputs?: unknown
    help?: string
  }

  class Importer {
    public canImport(context: Context, items: ExtensionItem[]): number
    public import(
      context: Context,
      items: ExtensionItem[],
      options: ExtensionOption,
    ): boolean | Promise<boolean>
  }

  class Generator {
    identifier: string
    title: string
    fileExtension?: string
    languageHighlighter?: string
    inputs?: unknown
    help?: string
    generate(
      context: Context,
      requests: Request[],
      options: ExtensionOption,
    ): string
  }

  class ExtensionImportFile {
    name: string
    path: string
  }

  class ExtensionOption {
    inputs: { [key: string]: any } | null
    file: ExtensionImportFile | null
    hideCredentials: boolean
    parent: RequestTreeItem | null
    order: number | null
  }

  class ExtensionItem {
    content: string
    name: string
    uri: string
    url: string | null
    file: ExtensionImportFile
    mimeType: string | null
    httpHeaders: object | null
    httpStatus: number | null
  }
}

export default Paw
