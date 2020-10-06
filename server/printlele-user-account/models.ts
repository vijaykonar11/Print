
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

export interface UserAccount {
  userId: string
  defaultPrinter: string
  balance: number
  isCodeGenerator: string
  isAuthorizedVendor: string
}

export interface TopUpCode {
  code: string
  amount: number
  appliedTo: string | undefined
  vendor: string
}

export interface Transaction {
  userId: string
  dateTime: number
  amount: number
  addedBy: string
  comment: string
  info: any
}