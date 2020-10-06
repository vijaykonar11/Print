import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'

import { APIResponse, Document } from './models'

let dynamo = new DynamoDB.DocumentClient();

const transactionList: Handler = (event: any, context: Context, callback: Callback) => {

  if(!event.requestContext.authorizer)
    return context.fail("Unauthorized access");
    
  let userId = event.requestContext.authorizer.claims['cognito:username'];

  let query = event.queryStringParameters;

  if(!query)
    query = {};

  let params : DynamoDB.DocumentClient.QueryInput = {
    TableName: process.env.transactionTable as string,
    KeyConditionExpression: 'userId = :userId' ,
    ExpressionAttributeValues: {
      ':userId' : userId
    },
    ProjectionExpression: 'userId, #dateTime, #comment, #amount',
    ExpressionAttributeNames: {
      '#dateTime': 'dateTime',
      '#comment': 'comment',
      '#amount': 'amount'
    },
    ScanIndexForward: false
  };

  if(query.lk_date){
    params.ExclusiveStartKey = {
      dateTime: parseInt(query.lk_date),
      userId
    };
  }
  if(query.count)
    params.Limit = query.count

  console.log('params');
  console.log(params);

  dynamo.query(params).promise()
  .then( (data) => {
    let result = new APIResponse(200, data);

    console.log(result);
    callback(undefined, result);
  })
  .catch( (err) => {
    console.log(err.message);
    return context.fail("Unable to get data. error: " + err.message);
  });

}

export { transactionList }