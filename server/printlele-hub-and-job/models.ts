
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

export interface PrintHub {
  id: string
  alias: string
  ownerId: string
  address: Address
  printers: Printer[]
}

export interface Address {
  streetAddress: string
  city: string
  state: string,
  country: string
  longitude: number
  latitude: number
}

export interface Printer {
  printerId: string
  alias: string
  name: string
  type: string
  properties: Property[]
  cost: Cost[]
  queueUrl: string | undefined
}

export interface Property {  
  colorType: string
  pageType: string
}

export interface Cost {
  colorType: string
  pageType: string
  costPerPage: number 
  specification: any
}

export interface PrintJob {
  id: string
  hubId: string
  printerAlias: string
  documentId: string
  printType: string
  noOfCopies: number
  status: Status[]
}

export interface Status {
  time: string
  value: string
}

export interface Order {
  id: string
  jobId: string[]
  documentId: string[]
  userId: string
  status: Status[]
  items: OrderItem[] | undefined
}

export interface OrderItem {
  name: string
  cost: number
}

export class Document {

    sharedWith: Share[]
    likes: Like[]
    comment: Comment[]
    active: boolean

    constructor(public id: string, public ownerId: string, public storageLocation: string, public alias: string, 
      public description: string, public type: string, public uploadDate: string, public pageCount: number){
        this.active = true;
        this.sharedWith = [];
        this.likes = [];
        this.comment = [];
    }
    
}

export class Share {
    
}

export class Like {

}

export class Comment {

}

export interface UserAccount {
  userId: string
  defaultPrinter: string
  balance: number
}

export interface Transaction {
  userId: string
  dateTime: number
  amount: number
  addedBy: string
  comment: string
  info: any
}