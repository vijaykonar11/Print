import { Handler, Context, Callback } from 'aws-lambda';
import { APIResponse } from './models'
import { getPrintHubs } from './helper'
import * as _ from 'lodash'

const getPrintHub: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.pathParameters.id;

  getPrintHubs(ownerId)
    .then(function (data) {

      let output = _.map(data.Items, (item) => {
        let item_i = item as any;
        item_i.printers = _.map(item_i.printers, (printer) => {
          delete printer.printerId;
          delete printer.queueUrl;
          return printer;
        });
        return item_i;
      });

      callback(undefined, new APIResponse(200, output));
    })
    .catch(function (err) {
      console.log(err.message);
      return callback(undefined, {
        statusCode: 500,
        body: "Unable to get print hubs. error: " + err.message
      });
    });
}

export { getPrintHub }