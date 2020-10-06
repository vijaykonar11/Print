import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'

import { APIResponse } from './models'

let dynamo = new DynamoDB.DocumentClient();

const deleteDocument: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];

  let docId = event.pathParameters.id;

  let params = {
    TableName: process.env.documentTable as string,
    Key: {
      id: docId
    },
    ConditionExpression: "#ownerId = :ownerId",
    UpdateExpression: "set #active=:active, #deletedAt=:deletedAt",
    ExpressionAttributeValues: {
      ":active": false,
      ":ownerId": ownerId,
      ":deletedAt": (new Date()) + ""
    },
    ExpressionAttributeNames: {
      '#active': 'active',
      '#ownerId': 'ownerId',
      '#deletedAt': 'deletedAt'
    },
    ReturnValues: "ALL_NEW"
  };

  dynamo.update(params).promise()
    .then((data) => {
      let result = new APIResponse(200, data);

      console.log("Deleted document: ");
      console.log(result);
      callback(undefined, result);
    })
    .catch((err) => {
      console.log(err.message);
      return context.fail("Unable to get data. error: " + err.message);
    });

}

export { deleteDocument }