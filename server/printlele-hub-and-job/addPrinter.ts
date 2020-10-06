import { Handler, Context, Callback } from 'aws-lambda';
import { v1 as uid } from 'uuid'

import { APIResponse, Printer, PrintHub } from './models'
import {
  addPrinter as addPrinterH, getPrintHub, createPrinterQueue, getPrinterByAlias,
  addPrinterIndex
} from './helper'

/**
 * Method to add a printer to a printer hub. It only allows if user is owner of
 * the passed printer hub. This method also checks if the printer if alias is already taken
 * If it pass above conditions, a new SQS queue is created printer job and printer object is 
 * added to Printer Hub.   
 * @param event 
 * @param context 
 * @param callback 
 */
const addPrinter: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];
  let ownerSub = event.requestContext.authorizer.claims.sub;
  let hubId = event.pathParameters.id;

  let printer: Printer = JSON.parse(event.body);

  //If printer alias is not provided return error
  if (!printer || !printer.alias) {
    let message = "alias not provided: " + JSON.stringify(printer);
    console.log(message);
    return callback(undefined, {
      statusCode: 401,
      body: message
    });
  }

  //See if printer alias is already used by any print hub
  getPrinterByAlias(printer.alias)
    .then((printerIndexResponse) => {
      if (printerIndexResponse.Item) {
        let message = "alias already in use: " + printer.alias;
        console.log(message);
        return callback(undefined, {
          statusCode: 401,
          body: message
        });
      } else {

        // As alias is not used else where, assign an unique id to printer object
        printer.printerId = uid();

        // Check if hub belongs to the owner, and retrieve hub object
        getPrintHub(ownerId, hubId)
          .then(function (printHubResponse) {
            if (printHubResponse.Item) {

              // Create a SQS queue for printer jobs which printers would be listening to
              createPrinterQueue(printer.printerId, ownerSub)
                .then((printQueue) => {
                  console.log("Queue created");
                  console.log(printQueue);

                  printer.queueUrl = printQueue.QueueUrl;

                  var printHub: PrintHub = printHubResponse.Item as any;

                  if (!printHub.printers)
                    printHub.printers = [];

                  printHub.printers.push(printer);

                  // Update hub Object to add printer to it's printers list
                  addPrinterH(printHub)
                    .then((updatedPrintHub) => {

                      // Add alias to Alias Index
                      addPrinterIndex(printer.alias, printHub)
                        .then((addPrinterResponse) => {
                          return callback(undefined, new APIResponse(200, updatedPrintHub));
                        }).catch((error) => {
                          let message = "Error adding alias to index: " + printer.alias;
                          console.log(message);
                          return callback(undefined, {
                            statusCode: 500,
                            body: message
                          });
                        });

                    })
                    .catch((err) => {
                      let message = "[ERROR] Unable to add PrintHub id " + hubId + " dont exist for " + ownerId + ". error: " + err.message;
                      console.log(message);
                      return callback(undefined, new APIResponse(500, {
                        statusCode: 500,
                        body: message
                      }));
                    });

                }).catch((error) => {
                  let message = "[ERROR] Unable to add SQS for PrintHub id " + hubId + " for " + ownerId + ". error: " + error.message;
                  console.log(message);
                  return callback(undefined, {
                    statusCode: 500,
                    body: message
                  });
                });
            } else {
              let message = "[FORBIDDEN] PrintHub id " + hubId + " dont exist for " + ownerId + ".";
              console.log(message);
              return callback(undefined, {
                statusCode: 401,
                body: message
              });
            }
          })
          .catch(function (err) {
            let message = "PrintHub id " + hubId + " get error " + ownerId + ". error: " + err.message;
            console.log(message);
            return callback(undefined, new APIResponse(500, {
              errorMessage: message
            }));
          });

      }
    }).catch((error) => {
      let message = "Error retreiving alias: " + printer.alias;
      console.log(message);
      return callback(undefined, {
        statusCode: 500,
        body: message
      });
    });

}

export { addPrinter }