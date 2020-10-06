import { Handler, Context, Callback } from 'aws-lambda';

import { APIResponse, IUploadDocumentRequest } from './models'
import DocumentService from './DocumentService'

const uploadDocument: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];
  let request: IUploadDocumentRequest = JSON.parse(event.body);

  DocumentService.uploadDocument(ownerId, request)
    .then((document) => {
      let result = new APIResponse(200, document);

      console.log(result);
      callback(undefined, result);
    })
    .catch((error) => {
      console.log("error");
      console.error(error)
      let result = new APIResponse(500, {
        errorMessage: error.message
      });

      console.log(result);
      callback(undefined, result);
    });

};

export { uploadDocument }

