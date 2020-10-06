import { DynamoDB, SQS } from 'aws-sdk'
import { APIResponse, UserAccount, Transaction, TopUpCode } from './models'
import * as _ from 'lodash'

import { v1 as uid } from 'uuid'

let dynamo = new DynamoDB.DocumentClient();
let sqs = new SQS();

export const getUserAccount = (userId: string): Promise<DynamoDB.GetItemOutput> => {

    let params = {
        TableName: process.env.userAccountTable as string,
        Key: {
            userId
        }
    };

    console.log("getUserAccount params: ");
    console.log(params);
    return dynamo.get(params).promise();
}

export const updateUserAccount = (userAccount: UserAccount): Promise<DynamoDB.UpdateItemOutput> => {

    let updateExpression = "set ";
    let expressionAttributeValues: any = {};
    let expressionAttributeNames: any = {};

    if (userAccount.defaultPrinter) {
        updateExpression = updateExpression + " #defaultPrinter=:defaultPrinter";
        expressionAttributeValues[":defaultPrinter"] = userAccount.defaultPrinter;
        expressionAttributeNames["#defaultPrinter"] = 'defaultPrinter';
    }

    if (updateExpression == "set ")
        throw new Error("Nothing to update");

    const params = {
        TableName: process.env.userAccountTable as string,
        Key: {
            "userId": userAccount.userId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: "ALL_NEW"
    };

    console.log("updateUserAccount params: ");
    console.log(params);
    return dynamo.update(params).promise();
}

export const addAccountBalance = (userAccount: UserAccount, amount: number): Promise<DynamoDB.UpdateItemOutput> => {
    const params = {
        TableName: process.env.userAccountTable as string,
        Key: {
            "userId": userAccount.userId
        },
        UpdateExpression: "set #balance=:newBalance",
        ConditionExpression: "#balance=:oldBalance",
        ExpressionAttributeValues: {
            ":newBalance": parseFloat(userAccount.balance as any) + parseFloat(amount as any),
            ":oldBalance": userAccount.balance
        },
        ExpressionAttributeNames: {
            '#balance': 'balance'
        },
        ReturnValues: "ALL_NEW"
    };

    console.log("addAccountBalance params: ");
    console.log(params);

    return dynamo.update(params).promise();
}

export const addTransaction = (transaction: Transaction): Promise<DynamoDB.PutItemOutput> => {
    let item = {
        TableName: process.env.transactionTable as string,
        Item: transaction,
        ReturnValue: "ALL_NEW"
    };

    return dynamo.put(item).promise();
}

export const getTopUpCodeRecord = (code: string): Promise<DynamoDB.GetItemOutput> => {
    let params = {
        TableName: process.env.topUpCodeTable as string,
        Key: {
            code
        }
    };

    console.log("getTopUpCodeRecord params: ");
    console.log(params);
    return dynamo.get(params).promise();
}

export const updateTopUpCodeAppliedTo = (code: string, account: string): Promise<DynamoDB.UpdateItemOutput> => {

    let params = {
        TableName: process.env.topUpCodeTable as string,
        Key: {
            code
        },
        UpdateExpression: "set #appliedTo=:account",
        ExpressionAttributeValues: {
            ":account": account
        },
        ExpressionAttributeNames: {
            "#appliedTo": "appliedTo"
        },
        ReturnValues: "ALL_NEW"
    };

    return dynamo.update(params).promise();
}

export const generateTopUpCodes = (amount: number, count: number, vendorId: string) => {
    let arr = [];

    for (let i = 0; i < count; i++) {
        let topUpCode : TopUpCode = {
            code: uid(),
            amount,
            vendor: vendorId,
            appliedTo: undefined
        };

        let item = {
            TableName: process.env.topUpCodeTable as string,
            Item: topUpCode,
            ReturnValue: "ALL_NEW"
        };


        arr.push(dynamo.put(item).promise());
    }

    return Promise.all(arr);
}