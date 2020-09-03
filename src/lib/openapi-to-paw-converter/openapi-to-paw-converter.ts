// eslint-disable-next-line import/extensions
import Paw from '../../types-paw-api/paw';
// eslint-disable-next-line import/extensions
import OpenAPI, { MapKeyedWithString } from '../../types-paw-api/openapi';
import URL from '../url';
import ParametersConverter from './components/parameters-converter';
import AuthConverter from './components/auth-converter';
import BodyConverter from './components/body-converter';

export default class OpenAPIToPawConverter {
  private context: Paw.Context;

  private readonly requestGroups: MapKeyedWithString<Paw.RequestGroup>;

  constructor(context: Paw.Context) {
    this.context = context;
    this.requestGroups = {};
  }

  convert(openApi: OpenAPI.OpenAPIObject, sourceFileName: string) {
    if (openApi.paths) {
      Object.entries(openApi.paths).forEach(([pathName, pathItem]) => {
        const operations = OpenAPIToPawConverter.extractOperationsFromPathItem(pathItem);

        Object.entries(operations).forEach((
          [method, operation]: [string, OpenAPI.OperationObject],
        ) => {
          const upperCasedMethod = method.toUpperCase();
          const fullUrl = URL.getFullUrlFromOpenAPI(pathItem, openApi, pathName);

          const requestGroup = this.getRequestGroup(sourceFileName);
          const request = this.importBaseRequestToPaw(upperCasedMethod, fullUrl, operation);
          requestGroup.appendChild(request);

          const parametersConverter = new ParametersConverter(request);
          parametersConverter.attachParametersFromOperationToRequest(operation);

          const authConverter = new AuthConverter(request, openApi);
          authConverter.attachAuthFromOperationToRequest(operation);

          const bodyConverter = new BodyConverter(request);
          bodyConverter.attachBodyFromOperationToRequest(operation);
        });
      });
    }
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
    fullUrl: string,
    operation: OpenAPI.OperationObject,
  ): Paw.Request {
    return this.context.createRequest(
      operation.summary ?? (operation.operationId ?? fullUrl),
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
