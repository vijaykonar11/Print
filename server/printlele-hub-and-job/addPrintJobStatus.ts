import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'
import moment from 'moment'

import { APIResponse, PrintJob, Status, PrintHub } from './models'
import { addJobStatus, getPrintJob, getPrintHubs } from './helper'

let dynamo = new DynamoDB.DocumentClient();

const addPrintJobStatus: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let ownerId = event.requestContext.authorizer.claims['cognito:username'];

  let jobId = event.pathParameters.id;
  let body = JSON.parse(event.body);

  console.log('job: ' + jobId);
  console.error('Error: ' + body.error);

  let job: PrintJob = undefined as any;

  getPrintJob(jobId)
    .then((jobResponse) => {
      if (jobResponse.Items && jobResponse.Items.length > 0) {
        job = (jobResponse.Items as any)[0];
        return getPrintHubs(ownerId);
      }

      throw new Error("Invalid job id");
    })
    .then( (hubResponse) => {
      if(hubResponse.Items && hubResponse.Items.length > 0){
        let hubs : PrintHub[] = hubResponse.Items as any;

        let flag = true;
        for(let i = 0; i < hubs.length; i++){
          if(hubs[i].id == job.hubId)
            flag = false
        }

        if(flag)
          throw new Error("UNAUTHORISED ACCESS to job")

        let status: Status = {
          value: body.update,
          time: moment().format('YYYY/MM/DD h:mm:ss a')
        }
        return addJobStatus(job, status);
      }

      throw new Error("UNAUTHORISED ACCESS: No Hub Associated to user");
    })
    .then( (jobResponse) => {
      let result = new APIResponse(200, jobResponse);
      callback(undefined, result);
    })
    .catch((error) => {
      console.log(error.message);
      return callback(undefined, new APIResponse(500, {
        errorMessage: "Unable update printjob status. error: " + error.message
      }));
    });

}

export { addPrintJobStatus }