import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB, S3 } from 'aws-sdk'

import { APIResponse, PrintJob, Document } from './models'
import { getPrintJob, getDocument } from './helper'

let dynamo = new DynamoDB.DocumentClient();
let s3 = new S3();

const getSignedDocumentURL: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let jobId = event.pathParameters.id;

  getPrintJob(jobId)
    .then((printJobResponse) => {
      if(printJobResponse.Items){
        let job: PrintJob = printJobResponse.Items[0] as any;
        return getDocument(job.documentId);
      }
      else
        throw new Error("No such job. Invalid job-id");
    })
    .then( (documentResponse) => {

      if(documentResponse.Item){
        let document: Document = documentResponse.Item as any;

        const signedUrlExpireSeconds = 60 * 5

        let signedUrl = s3.getSignedUrl('getObject', {
          Bucket: process.env.docBucket as string,
          Key: document.storageLocation,
          Expires: signedUrlExpireSeconds
        });

        let result = new APIResponse(200, { signedUrl });
        callback(undefined, result);
      } else {
        throw new Error("Document not found!");
      }
    })
    .catch((error) => {
      console.log(error.message);
      return callback(undefined, new APIResponse(500, {
        errorMessage: "Unable to get signed URL. error: " + error.message
      }));
    });

}

export { getSignedDocumentURL }