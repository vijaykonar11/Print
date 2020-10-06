import { Handler, Context, Callback } from 'aws-lambda';
import { APIResponse } from './models'
import { getUserAccount as getUserAccountH } from './helper'
import * as _ from 'lodash'

const getUserAccount: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let userId = event.requestContext.authorizer.claims['cognito:username'];

  getUserAccountH(userId)
    .then(function (data) {
      callback(undefined, new APIResponse(200, data));
    })
    .catch(function (err) {
      console.log(err.message);
      return callback(undefined, new APIResponse(500, {
        errorMessage: "Unable to get print hubs. error: " + err.message
      }));
    });
}

export { getUserAccount }