import { v1 as uid } from 'uuid'
import moment from 'moment'
import { S3, DynamoDB } from 'aws-sdk'
let PDFParser = require("pdf2json");
let fs = require('fs')
let getDocxPdfPageCount = require('docx-pdf-pagecount');

let s3 = new S3();
let dynamo = new DynamoDB.DocumentClient();

import { IUploadDocumentRequest } from './models'

const uploadDocument = (ownerId: string, request: IUploadDocumentRequest): Promise<Document> => {
    return new Promise<any>((resolve, reject) => {

        if (!request.fileType)
            reject("Invalid/Empty file type: " + request.fileType);

        request.docBuffer = new Buffer(request.base64string, 'base64');
        console.log("Document buffered");

        let document: Document | undefined = undefined;

        getPageCount(request.fileType, request.docBuffer)
            .then((pageCount) => {
                document = Document.createDocument(ownerId, request.fileType, request.fileName,
                    request.description, pageCount);
                return uploadDocumentToS3(document, request.docBuffer);
            })
            .then((putObjectResponse) => {
                if (document)
                    return insertDocumentRecord(document);
                else
                    throw new Error("Invalid Document object to Insert into DB");
            })
            .then((insertDocumentResponse) => {
                let response = document as any;
                response.clientFileId = request.clientFileId;
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

const uploadDocumentToS3 = (document: Document, docBuffer: Buffer): Promise<S3.PutObjectOutput> => {
    let params = {
        Bucket: process.env.docBucket as string,
        Key: document.storageLocation,
        Body: docBuffer
    };

    return s3.putObject(params).promise();
}

const insertDocumentRecord = (document: Document): Promise<DynamoDB.DocumentClient.PutItemOutput> => {
    let item = {
        TableName: process.env.documentTable as string,
        Item: document
    }

    return dynamo.put(item).promise();
}

const getPageCount = (fileType: string, docBuffer: Buffer): Promise<number> => {
    console.log("document fileType: " + fileType);
    return new Promise<number>((resolve, reject) => {

        if (fileType.toLowerCase() == 'pdf' || fileType.toLowerCase() == 'docx') {
            let path = `/tmp/${uid()}.${fileType}` ;
            console.log("path: " + path);

            fs.open(path, 'w', function (error, fd) {
                if (error)
                    reject(new Error("Unable open filesystem to write to file. " + error));

                console.log("path: " + path + " opened");

                fs.write(fd, docBuffer, 0, docBuffer.length, null, (err) => {
                    if (err)
                        reject(new Error("Unable to write to file." + err));

                    console.log("path: " + path + " written");
                    getDocxPdfPageCount(path)
                        .then(resolve)
                        .catch(reject);
                });
            });

        } else {
            console.log("Invalid file type: " + fileType);
            resolve(-1);
        }
    });
}

class Document {

    sharedWith: Share[]
    likes: Like[]
    comment: Comment[]
    active: boolean

    constructor(public id: string, public ownerId: string, public storageLocation: string, public alias: string,
        public description: string, public type: string, public uploadDate: string, public pageCount: number) {
        this.active = true;
        this.sharedWith = [];
        this.likes = [];
        this.comment = [];
    }

    public static createDocument: (ownerId: string, fileType: string, fileName: string, description: string, pageCount: number) => Document
    = (ownerId, fileType, fileName, description, pageCount) => {
        let now = moment().format('YYYY/MM/DD h:mm:ss a');
        let id = uid();
        let docKey = 'Owner-' + ownerId + '/File-' + id + '.' + fileType;

        return new Document(id, ownerId, docKey, fileName, description, fileType, now, pageCount);
    }
}

class Share {

}

class Like {

}

class Comment {

}


export default { uploadDocument }