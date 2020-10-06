import { Handler, Context, Callback } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk'
import moment from 'moment'

import { APIResponse, PrintHub, Order, PrintJob, Document, Transaction, UserAccount, Printer } from './models'
import {
  getOrder, getPrintJob, getPrintHubByPrinterAlias,
  addPrintJobToQueue, addOrderStatus, addJobStatus,
  addSQSMessageToJob, getCalculatedCost, getDocument,
  addAccountBalance, addTransaction, getUserAccount,
  submitGCPJob
} from './helper'

let dynamo = new DynamoDB.DocumentClient();

const checkoutOrder: Handler = (event: any, context: Context, callback: Callback) => {

  if (!event.requestContext.authorizer)
    return context.fail("Unauthorized access");

  let userId = event.requestContext.authorizer.claims['cognito:username'];
  let orderId = event.pathParameters.id;

  let printJob: PrintJob;
  let order: Order;
  let document: Document;
  let printHub: PrintHub;
  let orderCost: any;
  let userAccount: UserAccount;

  /**
   * 1) Get Order Object
   * 2) Get Print Job Object
   * 3) Get PrintHub Object
   * 4) Get Document Object
   * 5) Calculate Order cost using above
   * 6) Get User account Object
   * 7) If OrderCost is more than Balance, throw error
   * 8) If not, submit message to queue
   * 9) Update PrintJob object with SQS message ack
   * 10) Update PrintJob object status
   * 11) Update Order object status
   * 12) Deduct order cost from user's balance
   * 13) Add transaction to table
   * 14) return order and job object
   */

  getOrder(userId, orderId)
    .then((orderResponse) => {
      if (orderResponse.Item) {
        order = orderResponse.Item as any;

        if (order.status[order.status.length - 1].value != 'pending')
          throw new Error('Order is not in the pending state')

        return getPrintJob(order.jobId[0]);
      } else {
        throw new Error('No such order.');
      }
    })
    .then((printJobRespone) => {
      if (printJobRespone.Items) {
        printJob = printJobRespone.Items[0] as any;
        return getPrintHubByPrinterAlias(printJob.printerAlias);
      } else {
        throw new Error('No such print job');
      }
    })
    .then((printhubResponse) => {
      if (printhubResponse.Item) {
        printHub = printhubResponse.Item as any;
        return getDocument(printJob.documentId);
      } else {
        throw new Error('No such Print Hub');
      }
    })
    .then((documentResponse) => {
      document = documentResponse.Item as any;
      orderCost = getCalculatedCost(printHub, printJob, document);
      return getUserAccount(userId);
    })
    .then((userAccountResponse) => {
      userAccount = userAccountResponse.Item as any;
      if (!userAccount.balance || userAccount.balance < orderCost)
        throw new Error(`Insufficient balance. Order cost is ${orderCost} and Account balance is ${userAccount.balance}`);

      let printer: Printer | undefined;
      for (let i = 0; i < printHub.printers.length; i++)
        if (printHub.printers[i].alias == printJob.printerAlias)
          printer = printHub.printers[i];

      if(!printer)
        throw new Error('Printer Not found in print hub');

      if(printer.type == 'GCP') {
        return submitGCPJob(printer, printJob, document);
      } else {
        let sqsMessage = Object.assign({}, printJob);
        delete sqsMessage.documentId;
        delete sqsMessage.hubId;
        delete sqsMessage.printerAlias;
        delete sqsMessage.status;
        
        return addPrintJobToQueue(printer.queueUrl, sqsMessage);
      }
    })
    .then((messageResult) => {
      return addSQSMessageToJob(printJob, messageResult);
    })
    .then((jobUpdateResponse) => {
      return addJobStatus(printJob, {
        time: moment().format('YYYY/MM/DD h:mm:ss a'),
        value: 'InQueue'
      })
    })
    .then((jobUpdateResponse) => {
      printJob = jobUpdateResponse.Attributes as any;
      return addOrderStatus(order, {
        time: moment().format('YYYY/MM/DD h:mm:ss a'),
        value: 'InQueue'
      });
    })
    .then((orderUpdateResponse) => {
      order = orderUpdateResponse.Attributes as any;
      return addAccountBalance(userAccount, -1 * orderCost);
    })
    .then((accountBalanceResponse) => {
      let transaction: Transaction = {
        addedBy: userId,
        amount: -orderCost,
        comment: 'Payment for order: ' + order.id,
        dateTime: (new Date()).getTime(),
        info: { order, job: printJob },
        userId: userId
      };
      return addTransaction(transaction);
    })
    .then((transactionResponse) => {
      let transaction = transactionResponse.Attributes;
      let result = new APIResponse(200, {
        order, printJob, transaction
      });
      callback(undefined, result);
    })
    .catch((error) => {
      let result = new APIResponse(500, {
        errorMessage: error.message
      });
      console.log(error);
      callback(undefined, result);
    });

}

export { checkoutOrder }