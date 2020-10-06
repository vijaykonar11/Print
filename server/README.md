# PrintNets Server

### Technologies used
- [nodejs](https://nodejs.org/en/download/) Server side programming javascript runtime
- [AWS Lambda](https://aws.amazon.com/lambda/) abstract container for server side nodejs code
- [AWS API Gateway](https://aws.amazon.com/api-gateway/) an API interface to trigger AWS lambda code
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) NoSql Database (Key Value store) for application data
- [AWS SQS](https://aws.amazon.com/sqs/) Scalable push-pull queues for print jobs
- [AWS Cognito](https://aws.amazon.com/cognito/) provides user account management services

### Getting Started

You will need to have [node](https://nodejs.org/en/download/) installed to run this project. 

On the server-side we have 2 APIs. 
- document: Manage user documents
- print hub and job: Manage Print hubs, its printers and print jobs

Checkout this repo, install dependencies for both APIs.

Install all the dependencies using
```
> npm install
```

Start your project using
```
> npm start
```
