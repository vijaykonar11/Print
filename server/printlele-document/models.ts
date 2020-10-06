
export interface IUploadDocumentRequest {
  fileType: string
  docBuffer: Buffer
  fileName: string
  description: string
  clientFileId: string
  base64string: string
}

export class APIResponse {
  body: string;
  headers: any;

  constructor(public statusCode: number, private obj: object) {
    this.body = JSON.stringify(this.obj);
    delete(this.obj);

    this.headers = {
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials" : true
    }
  }
}

