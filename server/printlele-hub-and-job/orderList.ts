import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'

import { APIResponse } from './models'
import { getOrders } from './helper'

let dynamo = new DynamoDB.DocumentClient();

const orderList: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let userId = event.requestContext.authorizer.claims['cognito:username'];

  getOrders(userId)
    .then((data) => {
      let result = new APIResponse(200, data);
      callback(undefined, result);
    })
    .catch((error) => {
      console.log(error.message);
      return callback(undefined, new APIResponse(500, {
        errorMessage: "Unable to get orders. error: " + error.message
      }));
    });

}

export { orderList }