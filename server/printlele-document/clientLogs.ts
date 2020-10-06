import { Handler, Context, Callback } from 'aws-lambda';
import { APIResponse } from './models'

const clientLogs: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];
  let request = JSON.parse(event.body);
  request.ownerId = ownerId;

  console.log(request);

  let result = new APIResponse(200, {});
  callback(undefined, result);
};

export { clientLogs }

