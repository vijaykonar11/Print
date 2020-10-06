import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'

import { APIResponse } from './models'

let dynamo = new DynamoDB.DocumentClient();

const documentList: Handler = (event: any, context: Context, callback: Callback) => {

  if(!event.requestContext.authorizer)
    return context.fail("Unauthorized access");
    
  let ownerId = event.requestContext.authorizer.claims['cognito:username'];

  let query = event.queryStringParameters;

  if(!query)
    query = {};

  let params : DynamoDB.DocumentClient.QueryInput = {
    TableName: process.env.documentTable as string,
    IndexName: 'ownerIndex',
    KeyConditionExpression: 'ownerId = :ownerId' ,
    FilterExpression: '#active = :active',
    ExpressionAttributeValues: {
      ':ownerId' : ownerId,
      ':active' : true
    },
    ExpressionAttributeNames: {
      '#active': 'active'
    },
    ScanIndexForward: false
  };

  if(query.lk_date && query.lk_id){
    params.ExclusiveStartKey = {
      uploadDate: query.lk_date,
      id: query.lk_id,
      ownerId
    };
  }
  if(query.count)
    params.Limit = query.count

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

export { documentList }