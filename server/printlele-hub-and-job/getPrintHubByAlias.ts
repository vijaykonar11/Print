import { Handler, Context, Callback } from 'aws-lambda';
import { APIResponse } from './models'
import { getPrintHubByPrinterAlias as getPrintHubByPrinterAlias, removePrinterIdFromPrintHub } from './helper'
import * as _ from 'lodash'

/**
 * This method allows client to retrive a print hub by a alias of different types.
 * Types can be alias of a printer or a printer-hub.
 * @param event 
 * @param context 
 * @param callback 
 */
const getPrintHubByAlias: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let alias = event.pathParameters.alias;
  let type = event.pathParameters.type;

  if (type === "printer") {
    getPrintHubByPrinterAlias(alias)
      .then(function (data) {

        data.Item = removePrinterIdFromPrintHub(data.Item);
        callback(undefined, new APIResponse(200, data));

      })
      .catch(function (err) {
        console.log(err.message);
        return callback(undefined, {
          statusCode: 500,
          body: "Unable to get print hub by Alias. error: " + err.message
        });
      });
  } else {
    let message = "Operation not supported yet. type: " + type;
    console.log(message);
    return callback(undefined, new APIResponse(500, {
      errorMessage: message
    }));
  }

}

export { getPrintHubByAlias }