import { DynamoDB } from 'aws-sdk'
import { Handler, Context, Callback } from 'aws-lambda';
import { APIResponse, Transaction, UserAccount, TopUpCode } from './models'
import { getUserAccount, addAccountBalance, addTransaction, getTopUpCodeRecord, updateTopUpCodeAppliedTo } from './helper'
import * as _ from 'lodash'

const topUpAccount: Handler = (event: any, context: Context, callback: Callback) => {

    if (!event.requestContext.authorizer)
        return context.fail("Unauthorized access");

    let userId = event.requestContext.authorizer.claims['cognito:username'];
    let body = JSON.parse(event.body);

    if (body.code) {
        let accountToTopUp: UserAccount;
        let topUpCode: TopUpCode;
        let transaction: Transaction;
        let accountUpdateResponse: DynamoDB.UpdateItemOutput;

        getTopUpCodeRecord(body.code)
            .then((topUpCodeResponse) => {
                console.log('topUpCodeResponse')
                console.log(topUpCodeResponse)

                if (topUpCodeResponse.Item) {
                    topUpCode = topUpCodeResponse.Item as any;

                    if(topUpCode.appliedTo){
                        console.log("Code is already used!");
                        throw new Error("Code is already used!");
                    }

                    return updateTopUpCodeAppliedTo(topUpCode.code, userId);
                } else {
                    throw new Error("Invalid code!");
                }
            })
            .then( (updatedTopUpCodeRecord) => {
                console.log("updatedTopUpCodeRecord");
                console.log(updatedTopUpCodeRecord);
                
                return getUserAccount(userId);
            })
            .then((accountResponse) => {
                if (accountResponse.Item) {
                    accountToTopUp = accountResponse.Item as any;
                    return addAccountBalance(accountToTopUp, topUpCode.amount);
                } else {
                    throw new Error("Invalid userId being topped Up");
                }
            })
            .then((addAccountBalanceResponse) => {
                console.log("addAccountBalanceResponse");
                console.log(addAccountBalanceResponse);
                accountUpdateResponse = addAccountBalanceResponse;

                transaction = {
                    amount: topUpCode.amount,
                    addedBy: userId,
                    comment: "Self Top up",
                    userId: userId,
                    dateTime: new Date().getTime(),
                    info: { topUpCode }
                };

                return addTransaction(transaction);
            }).then((transactionResponse) => {
                let result = {
                    transaction, accountUpdateResponse, input: body
                };

                return callback(undefined, new APIResponse(200, result));
            })
            .catch((error) => {
                let message = error.message;
                console.log(message);
                return callback(undefined, new APIResponse(500, {
                    errorMessage: message
                }));
            });

    } else {
        getUserAccount(userId)
            .then((vendorAccountResponse) => {

                if (vendorAccountResponse.Item && vendorAccountResponse.Item.isAuthorizedVendor) {

                    getUserAccount(body.userId)
                        .then((userAccountResponse) => {

                            if (userAccountResponse.Item) {
                                addAccountBalance(userAccountResponse.Item as any, body.amount)
                                    .then((updateResponse) => {
                                        console.log("updateResponse");
                                        console.log(updateResponse);

                                        let transaction: Transaction = {
                                            amount: body.amount,
                                            addedBy: userId,
                                            comment: "Top up",
                                            userId: body.userId,
                                            dateTime: new Date().getTime(),
                                            info: {
                                                comment: body.comment
                                            }
                                        };

                                        addTransaction(transaction)
                                            .then((transactionResponse) => {
                                                let result = {
                                                    transaction, updateResponse, input: body
                                                };

                                                return callback(undefined, new APIResponse(200, result));
                                            })
                                            .catch((error) => {
                                                let message = "Error adding Transaction " + JSON.stringify(error);
                                                console.log(message);
                                                return callback(undefined, new APIResponse(500, {
                                                    errorMessage: message
                                                }));
                                            });
                                    })
                                    .catch((error) => {
                                        let message = "Error adding AccountBalance :" + JSON.stringify(error);
                                        console.log(message);
                                        return callback(undefined, new APIResponse(500, {
                                            errorMessage: message
                                        }));
                                    });
                            } else {
                                let message = "Invalid customer info :" + body.userId;
                                console.log(message);
                                return callback(undefined, new APIResponse(500, {
                                    errorMessage: message
                                }));
                            }

                        })
                        .catch((error) => {
                            let message = "Unable to retrive customer info :" + body.userId;
                            console.log(message);
                            return callback(undefined, new APIResponse(500, {
                                errorMessage: message
                            }));
                        });

                } else {
                    let message = "Not authorized Vendor :" + userId;
                    console.log(message);
                    return callback(undefined, new APIResponse(401, {
                        errorMessage: message
                    }));
                }
            })
            .catch(function (err) {
                let message = "Unable to get vendor user account. error: " + err.message + " userId:" + userId;
                console.log(message);
                return callback(undefined, new APIResponse(500, {
                    errorMessage: message
                }));
            });
    }

}

export { topUpAccount }