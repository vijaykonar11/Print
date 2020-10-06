import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'

import { APIResponse } from './models'

let dynamo = new DynamoDB.DocumentClient();

const getPrinters: Handler = (event: any, context: Context, callback: Callback) => {

  if(!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let result = new APIResponse(200, {});
  callback(undefined, result);
}

export { getPrinters }