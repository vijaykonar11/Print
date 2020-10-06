import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'
import { v1 as uid } from 'uuid'

import { APIResponse, PrintJob, Order } from './models'
import { addPrintJob, addOrder, getPrinterByAlias } from './helper'

let dynamo = new DynamoDB.DocumentClient();

const createOrder: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];

  let body = JSON.parse(event.body)

  getPrinterByAlias(body.printerAlias)
    .then((printerIndexResponse) => {
      let printerIndex = printerIndexResponse.Item;
      if (printerIndex) {

        let job: PrintJob = {
          id: uid(),
          hubId: printerIndex.hubId as string,
          printerAlias: body.printerAlias,
          documentId: body.documentId,
          printType: body.selectedType,
          noOfCopies: body.noOfCopies,
          status: [{
            time: (new Date()) + '',
            value: 'pending'
          }]
        }

        addPrintJob(job)
          .then((printJobResponse) => {
            let order: Order = {
              id: uid(),
              jobId: [job.id],
              documentId: [job.documentId],
              userId: ownerId,
              status: [{
                time: job.status[0].time,
                value: 'pending'
              }],
              items: undefined
            };

            addOrder(order)
              .then((orderResponse) => {
                let result = new APIResponse(200, order);
                callback(undefined, result);
              })
              .catch((error) => {
                let message = "Error adding order. error: " + error.message;
                console.log(message);
                return callback(undefined, new APIResponse(500, {
                  errorMessage: message
                }));
              });
          }).catch((error) => {
            let message = "Error adding job. error: " + error.message;
            console.log(message);
            return callback(undefined, new APIResponse(500, {
              errorMessage: message
            }));
          });

      } else {
        let message = "Invalid printer alias";
        console.log(message);
        return callback(undefined, new APIResponse(401, {
          errorMessage: message
        }));
      }
    })
    .catch((error) => {
      let message = "Error retreiving Printer Index. Alias: " + body.printerAlias;
      console.log(message);
      return callback(undefined, new APIResponse(500, {
        errorMessage: message
      }));
    });

}

export { createOrder }