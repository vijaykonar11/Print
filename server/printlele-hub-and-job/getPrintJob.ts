import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'

import { APIResponse } from './models'
import { getPrintJob as getPrintJobH } from './helper'


let dynamo = new DynamoDB.DocumentClient();

const getPrintJob: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let jobId = event.pathParameters.id;

  getPrintJobH(jobId)
    .then((printJobResponse) => {
      let result = new APIResponse(200, printJobResponse);
      callback(undefined, result);
    })
    .catch((error) => {
      console.log(error.message);
      return callback(undefined, new APIResponse(500, {
        errorMessage: "Unable to get printjob. error: " + error.message
      }));
    });

}

export { getPrintJob }