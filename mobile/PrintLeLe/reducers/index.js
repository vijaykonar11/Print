import { combineReducers } from 'redux';

import Tokens from './reducer-tokens'
import Documents from './reducer-documents'
import UploadDocuments from './reducer-upload-documents'

const rootReducer = combineReducers({
  Tokens, 
  Documents,
  UploadDocuments
});

export default rootReducer;
