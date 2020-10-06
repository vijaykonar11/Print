import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB, S3 } from 'aws-sdk'

import { APIResponse } from './models'

let dynamo = new DynamoDB.DocumentClient();
let s3 = new S3();

const getDocument: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];

  let docId = event.pathParameters.id;

  let params = {
    TableName: process.env.documentTable as string,
    Key: {
      id: docId
    }
  };

  dynamo.get(params).promise()
    .then((data) => {

      if(data.Item){
        let signedUrl = s3.getSignedUrl('getObject', {
          Bucket: process.env.docBucket as string,
          Key: data.Item.storageLocation,
          Expires: 5 * 60
        });

        data.Item.downloadUrl = signedUrl;
      }

      let result = new APIResponse(200, data);

      console.log(result);
      callback(undefined, result);
    })
    .catch((err) => {
      console.log(err.message);
      return context.fail("Unable to get data. error: " + err.message);
    });

}

export { getDocument }