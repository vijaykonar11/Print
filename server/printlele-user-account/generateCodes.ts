import { DynamoDB } from 'aws-sdk'
import { Handler, Context, Callback } from 'aws-lambda';
import { APIResponse, UserAccount, TopUpCode } from './models'
import { getUserAccount, generateTopUpCodes } from './helper'
import * as _ from 'lodash'

const generateCodes: Handler = (event: any, context: Context, callback: Callback) => {

    if (!event.requestContext.authorizer)
        return context.fail("Unauthorized access");

    let userId = event.requestContext.authorizer.claims['cognito:username'];
    let body = JSON.parse(event.body);

    console.log('userId');
    console.log(userId);

    let accountToTopUp: UserAccount;

    getUserAccount(userId)
        .then((accountResponse) => {
            if (body.password != process.env.codeGenPass)
                throw new Error("Don't fuck with us. You are caught.");

            if (accountResponse.Item) {
                accountToTopUp = accountResponse.Item as any;

                if (accountToTopUp.isCodeGenerator == "yes") {
                    return generateTopUpCodes(body.amount, body.count, body.vendorId);
                } else {
                    throw new Error("User don't have permission to generate codes.");
                }
            } else {
                throw new Error("Invalid user");
            }
        })
        .then( (responses) => {
            let result = {
                message: responses.length + " codes created"
            }
            return callback(undefined, new APIResponse(200, result));
        })
        .catch((error) => {
            let message = error.message;
            console.log(message);
            return callback(undefined, new APIResponse(500, {
                errorMessage: message
            }));
        });

}

export { generateCodes }