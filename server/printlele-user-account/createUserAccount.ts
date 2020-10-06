import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'

import { APIResponse, UserAccount } from './models'
import { getUserAccount, updateUserAccount } from './helper'

let dynamo = new DynamoDB.DocumentClient();

const createUserAccount: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let userId = event.requestContext.authorizer.claims['cognito:username'];

  let userAccount: UserAccount = JSON.parse(event.body);
  userAccount.userId = userId;
  delete userAccount.balance;

  getUserAccount(userId)
    .then(function (data) {
      if (data.Item) {

        updateUserAccount(userAccount)
          .then((data) => {
            return callback(undefined, new APIResponse(200, {
              updatedData: data
            }));
          })
          .catch((err) => {
            let message = "Unable to update UserAccount id " + userAccount.userId;
            console.log(message);
            return callback(undefined, new APIResponse(500, {
              errorMessage: message
            }));
          });

      } else {
        let newUserAccount = {
          userId: userAccount.userId,
          balance: 5, //PROMO Balance
          defaultPrinter: userAccount.defaultPrinter
        }

        let item = {
          TableName: process.env.userAccountTable as string,
          Item: newUserAccount,
          ReturnValue: "ALL_NEW"
        };

        dynamo.put(item).promise()
          .then((data) => {
            let result = new APIResponse(200, data);
            console.log(result);
            callback(undefined, result);
          })
          .catch((error) => {
            let message = "Unable to insert into UserAccount " + userId + " . error: " + error.message;
            console.log(message);
            return callback(undefined, new APIResponse(500, {
              errorMessage: message
            }));
          });

      }
    })
    .catch(function (err) {
      let message = "Unable to get UserAccount " + userId + " . error: " + err.message;
      console.log(message);
      return callback(undefined, new APIResponse(500, {
        errorMessage: message
      }));
    });

}

export { createUserAccount }