import { combineReducers } from 'redux';

import Tokens from './reducer-tokens'
import Documents from './reducer-documents'
import UploadDocuments from './reducer-upload-documents'
import CurrentOrder from './reducer-current-order'
import UserAccount from './reducer-user-account'
import Orders from './reducer-orders'
import MyPrintHubs from './reducer-my-print-hubs'
import PrintHubs from './reducer-print-hubs'
import HubOrders from './reducer-hub-orders'
import LocalHub from './reducer-local-hub'
import Transactions from './reducer-transactions'

const rootReducer = combineReducers({
  Tokens, 
  Documents,
  UploadDocuments,
  CurrentOrder,
  UserAccount,
  Orders,
  MyPrintHubs,
  PrintHubs,
  HubOrders,
  LocalHub,
  Transactions
});

export default rootReducer;
