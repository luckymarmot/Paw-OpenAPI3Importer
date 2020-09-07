// eslint-disable-next-line import/extensions
import Paw from '../../types-paw-api/paw';
// eslint-disable-next-line import/extensions
import OpenAPI, { MapKeyedWithString } from '../../types-paw-api/openapi';
import EnvironmentManager from '../environment-manager';
import URL from '../url';
import AuthConverter from './components/auth-converter';
import ParametersConverter from './components/parameters-converter';
import BodyConverter from './components/body-converter';

export default class OpenAPIToPawConverter {
  private readonly context: Paw.Context;

  private readonly requestGroups: MapKeyedWithString<Paw.RequestGroup>;

  private readonly envManagers: MapKeyedWithString<EnvironmentManager>;

  constructor(context: Paw.Context) {
    this.context = context;
    this.requestGroups = {};
    this.envManagers = {};
  }

  convert(openApi: OpenAPI.OpenAPIObject, sourceFileName: string) {
    if (openApi.paths) {
      Object.entries(openApi.paths).forEach(([pathName, pathItem]) => {
        const operations = OpenAPIToPawConverter.extractOperationsFromPathItem(pathItem);

        Object.entries(operations).forEach((
          [method, operation]: [string, OpenAPI.OperationObject],
        ) => {
          const envManager = this.getEnvManager(sourceFileName);

          const upperCasedMethod = method.toUpperCase();
          const url = new URL(pathItem, openApi, pathName, envManager);

          const requestGroup = this.getRequestGroup(sourceFileName);
          const request = this.importBaseRequestToPaw(
            upperCasedMethod,
            url.fullUrl as DynamicString,
            operation,
          );
          requestGroup.appendChild(request);

          const parametersConverter = new ParametersConverter(request, envManager);
          parametersConverter.attachParametersFromOperationToRequest(operation);
          if (url.serverVariables) {
            parametersConverter.attachParametersFromServerVariables(url.serverVariables);
          }

          const authConverter = new AuthConverter(request, openApi);
          authConverter.attachAuthFromOperationToRequest(operation);

          const bodyConverter = new BodyConverter(request);
          bodyConverter.attachBodyFromOperationToRequest(operation);
        });
      });
    }
  }

  private getEnvManager(sourceFileName: string): EnvironmentManager {
    if (typeof this.envManagers[sourceFileName] === 'undefined') {
      const formattedGroupName = sourceFileName.replace(/\.json|\.yaml/i, '');
      this.envManagers[formattedGroupName] = new EnvironmentManager(
        this.context,
        formattedGroupName,
      );
    }

    return this.envManagers[sourceFileName];
  }

  private getRequestGroup(sourceFileName: string): Paw.RequestGroup {
    if (typeof this.requestGroups[sourceFileName] === 'undefined') {
      const formattedGroupName = sourceFileName.replace(/\.json|\.yaml/i, '');
      this.requestGroups[sourceFileName] = this.context.createRequestGroup(formattedGroupName);
    }

    return this.requestGroups[sourceFileName];
  }

  private importBaseRequestToPaw(
    method: string,
    fullUrl: DynamicString|string,
    operation: OpenAPI.OperationObject,
  ): Paw.Request {
    return this.context.createRequest(
      operation.summary ?? (operation.operationId ?? fullUrl as string),
      method,
      fullUrl,
      operation.description ?? null,
    );
  }

  static extractOperationsFromPathItem(
    pathItem: OpenAPI.PathItemObject,
  ): MapKeyedWithString<OpenAPI.OperationObject> {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      $ref = null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      summary = null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      description = null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      servers = null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parameters = null,
      ...operations
    } = pathItem;

    return operations as MapKeyedWithString<OpenAPI.OperationObject>;
  }
}
