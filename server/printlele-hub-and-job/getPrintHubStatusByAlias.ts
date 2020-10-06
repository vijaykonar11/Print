import { Handler, Context, Callback } from 'aws-lambda';
import { APIResponse, Printer, PrintHub } from './models'
import { getPrinterStatus as getGCPPrinterStatus } from './GoogleCloudPrintService'
import { getPrintHubByPrinterAlias } from './helper'
import * as _ from 'lodash'

/**
 * This method allows client to retrive a print hub by a alias of different types.
 * Types can be alias of a printer or a printer-hub.
 * @param event 
 * @param context 
 * @param callback 
 */
const getPrintHubStatusByAlias: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let alias = event.pathParameters.alias;

  getPrintHubByPrinterAlias(alias)
    .then(function (data) {
      console.log('data')
      console.log(data)

      let printerHub: PrintHub = data.Item as any;
      let printer: Printer | undefined;

      for(let i = 0 ; i < printerHub.printers.length; i++)
        if(printerHub.printers[i].alias == alias)
            printer = printerHub.printers[i];


      if (printer && printer.type == "GCP") {
        return getGCPPrinterStatus(printer.name)
      } else {
        throw new Error("Printer Status not supported yet.");
      }
    })
    .then((statusResponse) => {
      return callback(undefined, new APIResponse(200, statusResponse));
    })
    .catch(function (err) {
      console.log(err.message);
      return callback(undefined, {
        statusCode: 500,
        body: "Unable to get printer status. error: " + err.message
      });
    });

}

export { getPrintHubStatusByAlias }