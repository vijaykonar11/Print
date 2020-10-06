import { Handler, Context, Callback } from 'aws-lambda';
import { APIResponse } from './models'
import { getPrintHubs } from './helper'

const getPrintHubMe: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];

  getPrintHubs(ownerId)
    .then(function (data) {
      callback(undefined, new APIResponse(200, data));
    })
    .catch(function (err) {
      console.log(err.message);
      return callback(undefined, {
        statusCode: 500,
        body: "Unable to get print hubs. error: " + err.message
      });
    });

}

export { getPrintHubMe }