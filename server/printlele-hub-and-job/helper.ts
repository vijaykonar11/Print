import { DynamoDB, SQS, S3 } from 'aws-sdk'
import {
    APIResponse, PrintHub, Printer, PrintJob, Order, Status,
    Document, UserAccount, Transaction
} from './models'
import * as _ from 'lodash'
import { v1 as uid } from 'uuid'

let request = require('request')
const fs = require('fs');

let dynamo = new DynamoDB.DocumentClient();
let sqs = new SQS();
let s3 = new S3();

let oauthToken: string | undefined = undefined;
let tokenTime: number = -1;
let expirySec: number = -1;

export const getPrintHub = (ownerId: string | undefined, hubId: string): Promise<DynamoDB.GetItemOutput> => {

    let params = {
        TableName: process.env.printHubTable as string,
        Key: {
            id: hubId,
            ownerId: ownerId
        }
    };

    console.log("getPrintHub params: ");
    console.log(params);
    return dynamo.get(params).promise();
}

export const getPrintHubByPrinterAlias = (alias: string): Promise<DynamoDB.GetItemOutput> => {

    return new Promise<DynamoDB.GetItemOutput>((resolve, reject) => {
        let params = {
            TableName: process.env.printIndexTable as string,
            Key: {
                alias: alias
            }
        };

        console.log("getPrintHubByPrinterAlias params: ");
        console.log(params);
        dynamo.get(params).promise()
            .then((printerIndexResponse) => {
                if (printerIndexResponse.Item)
                    getPrintHub(printerIndexResponse.Item.ownerId, printerIndexResponse.Item.hubId)
                        .then(resolve).catch(reject);
                else
                    reject({ error: "No Hub for given alias" })
            })
            .catch(reject);
    });
}

export const getPrintHubs = (ownerId: string | undefined): Promise<DynamoDB.QueryOutput> | Promise<DynamoDB.ScanOutput> => {

    if (ownerId) {
        let params = {
            TableName: process.env.printHubTable as string,
            KeyConditionExpression: 'ownerId = :ownerId',
            ExpressionAttributeValues: {
                ':ownerId': ownerId
            }
        };

        console.log("getPrintHubs params: ");
        console.log(params);
        return dynamo.query(params).promise();
    } else {
        let params: DynamoDB.ScanInput = {
            TableName: process.env.printHubTable as string
        };

        return dynamo.scan(params).promise();
    }
}

export const updatePrintHub = (printHub: PrintHub): Promise<DynamoDB.UpdateItemOutput> => {
    const params = {
        TableName: process.env.printHubTable as string,
        Key: {
            "id": printHub.id,
            "ownerId": printHub.ownerId
        },
        UpdateExpression: "set #address=:address, #alias=:alias",
        ExpressionAttributeValues: {
            ":address": printHub.address,
            ":alias": printHub.alias
        },
        ExpressionAttributeNames: {
            '#address': 'address',
            '#alias': 'alias',
        },
        ReturnValues: "ALL_NEW"
    };

    console.log("updatePrintHub params: ");
    console.log(params);
    return dynamo.update(params).promise();
}

export const addPrinter = (printHub: PrintHub): Promise<DynamoDB.UpdateItemOutput> => {

    const params = {
        TableName: process.env.printHubTable as string,
        Key: {
            "id": printHub.id,
            "ownerId": printHub.ownerId
        },
        UpdateExpression: "set #printers=:printers",
        ExpressionAttributeValues: {
            ":printers": printHub.printers
        },
        ExpressionAttributeNames: {
            '#printers': 'printers'
        },
        ReturnValues: "ALL_NEW"
    };

    console.log("addPrinter params: ");
    console.log(params);
    return dynamo.update(params).promise();
}

export const createPrinterQueue = (printerId: string, ownerSub: string): Promise<SQS.CreateQueueResult> => {

    let policy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: {
                    Federated: "cognito-identity.amazonaws.com"
                },
                Action: [
                    "sqs:ReceiveMessage",
                    "sqs:GetQueueAttributes",
                    "sqs:GetQueueUrl",
                    "sqs:ListQueues"
                ],
                Condition: {
                    StringEquals: {
                        "cognito-identity.amazonaws.com:sub": process.env.region + ":" + '9dc0ac57-3c36-47cb-bbdc-eab53e5181b5'
                    }
                }
            }
        ]
    };

    const newQueueParams: SQS.CreateQueueRequest = {
        QueueName: 'printlele-' + printerId,
        Attributes: {
            VisibilityTimeout: '7200',
            Policy: JSON.stringify(policy)
        }
    };

    console.log("createPrinterQueue newQueueParams: ");
    console.log(newQueueParams);
    return sqs.createQueue(newQueueParams).promise();
}

export const getPrinterByAlias = (alias: string): Promise<DynamoDB.GetItemOutput> => {

    let params = {
        TableName: process.env.printIndexTable as string,
        Key: { alias }
    };

    console.log("getPrinterByAlias params: ")
    console.log(params)
    return dynamo.get(params).promise();
}

export const addPrinterIndex = (alias: string, printHub: PrintHub): Promise<DynamoDB.PutItemOutput> => {

    let item = {
        TableName: process.env.printIndexTable as string,
        Item: {
            alias: alias,
            hubId: printHub.id,
            ownerId: printHub.ownerId
        },
        ReturnValue: "ALL_NEW"
    };

    console.log("addPrinterIndex item: ")
    console.log(item)
    return dynamo.put(item).promise();
}

export const removePrinterIdFromPrintHub = (printerHub: any) => {
    let item_i = printerHub;
    item_i.printers = _.map(item_i.printers, (printer) => {
        delete printer.printerId;
        delete printer.queueUrl;
        return printer;
    });
    return item_i;
}

export const removePrinterIdFromPrintHubs = (printerHubs: any) => {
    return _.map(printerHubs, (item) => {
        return removePrinterIdFromPrintHub(item);
    });
}

export const addPrintJob = (job: PrintJob): Promise<DynamoDB.PutItemOutput> => {
    let item = {
        TableName: process.env.printJobTable as string,
        Item: job,
        ReturnValue: "ALL_NEW"
    };

    console.log("addPrintJob item: ")
    console.log(item)
    return dynamo.put(item).promise();
}

export const addOrder = (order: Order): Promise<DynamoDB.PutItemOutput> => {
    let item = {
        TableName: process.env.orderTable as string,
        Item: order,
        ReturnValue: "ALL_NEW"
    };

    console.log("addPrintJob item: ")
    console.log(item)
    return dynamo.put(item).promise();
}

export const getOrders = (userId: string): Promise<DynamoDB.QueryOutput> => {

    let params = {
        TableName: process.env.orderTable as string,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    };

    console.log("getOrders params: ");
    console.log(params);
    return dynamo.query(params).promise();
}

export const getOrder = (userId: string, orderId: string): Promise<DynamoDB.GetItemOutput> => {

    let params = {
        TableName: process.env.orderTable as string,
        Key: {
            userId: userId,
            id: orderId
        }
    };

    console.log("getOrder params: ");
    console.log(params);
    return dynamo.get(params).promise();
}

export const getPrintJob = (jobId: string): Promise<DynamoDB.QueryOutput> => {

    let params = {
        TableName: process.env.printJobTable as string,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': jobId
        }
    };

    console.log("getPrintJob params: ");
    console.log(params);
    return dynamo.query(params).promise();
}

export const addPrintJobToQueue = (queueUrl: string | undefined, printJob: PrintJob): any => {

    let params: SQS.SendMessageRequest = {
        MessageBody: JSON.stringify(printJob),
        QueueUrl: queueUrl as string
    };

    return sqs.sendMessage(params).promise();
}

export const addOrderStatus = (order: Order, status: Status): Promise<DynamoDB.UpdateItemOutput> => {
    order.status.push(status);

    const params = {
        TableName: process.env.orderTable as string,
        Key: {
            "id": order.id,
            "userId": order.userId
        },
        UpdateExpression: "set #status=:status",
        ExpressionAttributeValues: {
            ":status": order.status
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ReturnValues: "ALL_NEW"
    };

    console.log("addOrderStatus params: ");
    console.log(params);
    return dynamo.update(params).promise();
}

export const addJobStatus = (job: PrintJob, status: Status): Promise<DynamoDB.UpdateItemOutput> => {
    job.status.push(status);

    const params = {
        TableName: process.env.printJobTable as string,
        Key: {
            "id": job.id,
            "documentId": job.documentId
        },
        UpdateExpression: "set #status=:status",
        ExpressionAttributeValues: {
            ":status": job.status
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        },
        ReturnValues: "ALL_NEW"
    };

    console.log("addJobStatus params: ");
    console.log(params);
    return dynamo.update(params).promise();
}

export const addSQSMessageToJob = (job: PrintJob, messageResult: any): Promise<DynamoDB.UpdateItemOutput> => {
    const params = {
        TableName: process.env.printJobTable as string,
        Key: {
            "id": job.id,
            "documentId": job.documentId
        },
        UpdateExpression: "set #sqsMessageResult=:sqsMessageResult",
        ExpressionAttributeValues: {
            ":sqsMessageResult": JSON.stringify(messageResult)
        },
        ExpressionAttributeNames: {
            '#sqsMessageResult': 'sqsMessageResult'
        },
        ReturnValues: "ALL_NEW"
    };

    console.log("addSQSMessageToJob params: ");
    console.log(params);
    return dynamo.update(params).promise();
}

export const getCalculatedCost = (printerHub: PrintHub, job: PrintJob, document: Document): number => {
    if (!printerHub)
        return -1;

    console.log("job");
    console.log(job);

    let printer: Printer | undefined = undefined;
    let costPerPage: any = undefined;
    let printers = printerHub.printers;

    for (let i = 0; i < printers.length; i++)
        if (printers[i].alias == job.printerAlias)
            printer = printers[i];

    if (!printer)
        throw new Error('Printer Not found');

    console.log("checkout printer");
    console.log(printer);

    for (let i = 0; i < printer.cost.length; i++)
        if (printer.cost[i].colorType === job.printType)
            costPerPage = printer.cost[i].costPerPage;

    if (!costPerPage)
        throw new Error('There is no cost associated to the selected printType');

    let totalCost = job.noOfCopies * parseFloat(costPerPage) * document.pageCount;

    return totalCost;
}

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

export const addAccountBalance = (userAccount: UserAccount, amount: number): Promise<DynamoDB.UpdateItemOutput> => {
    const params = {
        TableName: process.env.userAccountTable as string,
        Key: {
            "userId": userAccount.userId
        },
        UpdateExpression: "set #balance=:newBalance",
        ConditionExpression: "#balance=:oldBalance",
        ExpressionAttributeValues: {
            ":newBalance": userAccount.balance + amount,
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

export const getDocument = (id: string): Promise<DynamoDB.GetItemOutput> => {
    let params = {
        TableName: process.env.documentTable as string,
        Key: {
            id
        }
    };

    return dynamo.get(params).promise();
}

export const getSignedUrlOfDocument = (document: Document) => {

    const signedUrlExpireSeconds = 60 * 5

    return s3.getSignedUrl('getObject', {
        Bucket: process.env.docBucket as string,
        Key: document.storageLocation,
        Expires: signedUrlExpireSeconds
    });
}

const postGCPJob = (printer: Printer, job: PrintJob, document: Document,
    resolve: (x: any) => void, reject: (x: any) => void) => {

    let submitUrl = process.env.printJobSubmitUrl as string;
    let documentUrl = getSignedUrlOfDocument(document);

    let specification = {};
    for (let i = 0; i < printer.cost.length; i++) {
        if (printer.cost[i].colorType == job.printType)
            specification = printer.cost[i].specification
    }

    specification = Object.assign(specification, {
        copies: {
            copies: job.noOfCopies
        }
    });

    let ticket = {
        version: "1.0",
        print: specification
    };

    let file = '/tmp/' + document.alias;

    request.get({ url: documentUrl }).pipe(fs.createWriteStream(file)).on('finish', function () {

        let formData = {
            printerid: printer.name,
            ticket: JSON.stringify(ticket),
            title: job.id,
            content: fs.createReadStream(file)
        };
        console.log('Submit GCP Job');
        console.log(JSON.stringify(formData));

        request({
            method: 'POST',
            url: submitUrl,
            formData: formData,
            headers: {
                Authorization: 'OAuth ' + oauthToken
            }
        }, (error, response, body) => {
            if (error)
                reject(error);
            else
                resolve(JSON.parse(body));
        });
    });
}

export const submitGCPJob = (printer: Printer, job: PrintJob, document: Document): Promise<any> => {
    let currentSec = Date.now() / 1000;

    console.log(`submitGCPJob oauthToken ${oauthToken} currentSec ${currentSec} tokenTime ${tokenTime} expirySec ${expirySec}`);

    return new Promise((resolve, reject) => {
        if (!oauthToken || (tokenTime + expirySec < currentSec)) {

            console.log('Fetching new access token');
            let tokenUrl = process.env.googleOAuthTokenUrl;
            request({
                method: 'POST',
                url: tokenUrl,
                form: {
                    refresh_token: process.env.googleOAuthRefreshToken,
                    client_id: process.env.googleOAuthClientId,
                    client_secret: process.env.googleOAuthClientSecret,
                    grant_type: 'refresh_token'
                }
            }, (error, response, body) => {
                if (error) {
                    console.log('Error retrieving new token')
                    console.log(error)
                    throw new Error('Error retrieving new token ' + JSON.stringify(error));
                }

                console.log('new token body');
                console.log(body);
                body = JSON.parse(body);

                oauthToken = body.access_token;
                expirySec = body.expires_in;
                tokenTime = currentSec;

                console.log('New token retrieved at ' + tokenTime);
                postGCPJob(printer, job, document, resolve, reject);
            });

        } else {
            postGCPJob(printer, job, document, resolve, reject);
        }
    });

}
