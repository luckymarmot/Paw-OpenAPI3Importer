// eslint-disable-next-line import/extensions
import Paw from '../../../types-paw-api/paw';
// eslint-disable-next-line import/extensions
import OpenAPI, { MapKeyedWithString } from '../../../types-paw-api/openapi';

export default class BodyConverter {
  private request: Paw.Request;

  constructor(request: Paw.Request) {
    this.request = request;
  }

  attachBodyFromOperationToRequest(operation: OpenAPI.OperationObject) {
    if ((operation?.requestBody as OpenAPI.RequestBodyObject)?.content) {
      Object.entries((operation.requestBody as OpenAPI.RequestBodyObject).content)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .forEach(([contentType, mediaType]: [string, OpenAPI.MediaTypeObject]) => {
          if ((mediaType.example as OpenAPI.ExampleObject)?.value) {
            this.request.body = (mediaType.example as OpenAPI.ExampleObject).value;
          } else if (
            Object.keys(mediaType.examples as MapKeyedWithString<OpenAPI.ExampleObject>).length > 0
          ) {
            const { examples = {} } = mediaType;
            const firstExampleKey = Object.keys(examples)[0];
            if ((examples[firstExampleKey] as OpenAPI.ExampleObject).value) {
              this.request.body = (examples[firstExampleKey] as OpenAPI.ExampleObject).value;
            }
          }

          /**
           * @TODO
           * check this after generating example files
           */
          // if (this.request.body) {
          //   switch (contentType.toLowerCase()) {
          //     case 'application/json':
          //       this.request.jsonBody = JSON.parse(this.request.body as string);
          //       break;
          //     case 'application/x-www-form-urlencoded':
          //       this.request.urlEncodedBody = JSON.parse(this.request.body as string);
          //       break;
          //     case 'multipart/form-data':
          //       this.request.multipartBody = JSON.parse(this.request.body as string);
          //       break;
          //     default:
          //     // nothing
          //   }
          // }
        });
    }
  }
}
