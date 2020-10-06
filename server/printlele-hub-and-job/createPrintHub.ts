import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'
import { v1 as uid } from 'uuid'

import { APIResponse, PrintHub } from './models'
import { getPrintHub, updatePrintHub } from './helper'

let dynamo = new DynamoDB.DocumentClient();

const createPrintHub: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];

  let printHub: PrintHub = JSON.parse(event.body);
  printHub.ownerId = ownerId;

  if (printHub.id) {

    getPrintHub(printHub.ownerId, printHub.id)
      .then(function (data) {
        if (data.Item) {

          updatePrintHub(printHub)
            .then((data) => {
              return callback(undefined, new APIResponse(200, {
                updatedData: data
              }));
            })
            .catch((err) => {
              console.log("Unable to update PrintHub id " + printHub.id + " for " + ownerId + ".");
              return callback(undefined, {
                statusCode: 500,
                body: "Unable to update PrintHub id " + printHub.id + " for " + ownerId + "."
              });
            });

        } else {
          console.log("[FORBIDDEN] PrintHub id " + printHub.id + " dont exist for " + ownerId + ".");
          return callback(undefined, {
            statusCode: 401,
            body: "[FORBIDDEN] PrintHub id " + printHub.id + " dont exist for " + ownerId + "."
          });
        }
      })
      .catch(function (err) {
        console.log("PrintHub id " + printHub.id + " dont exist for " + ownerId + ". error: " + err.message);
        return callback(undefined, new APIResponse(500, {
          errorMessage: "PrintHub id " + printHub.id + " dont exist for " + ownerId + ". error: " + err.message
        }));
      });

  } else {
    let id = uid();
    printHub.id = id;

    let item = {
      TableName: process.env.printHubTable as string,
      Item: printHub,
      ReturnValue: "ALL_NEW"
    };

    dynamo.put(item).promise()
      .then(function (data) {
        let result = new APIResponse(200, data);

        console.log(result);
        callback(undefined, result);
      })
      .catch(function (err) {
        console.log(err.message);
        return callback(undefined, {
          statusCode: 500,
          body: "Unable to insert object in table. error: " + err.message
        });
      });
  }

}

export { createPrintHub }