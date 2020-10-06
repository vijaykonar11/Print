import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { BrowserRouter } from 'react-router-dom'
import ReduxPromise from 'redux-promise'
import ReduxThunk from 'redux-thunk'
import axios from 'axios'

import App from './containers/app';
import reducers from './reducers';
import AddTokenToAWSRequest from './middleware/add-token-to-aws-request'
import AddTokenToAxiosRequest from './middleware/add-token-to-axios-request'
import { logUrl } from './config'

const createStoreWithMiddleware = applyMiddleware(ReduxThunk, ReduxPromise, AddTokenToAWSRequest, AddTokenToAxiosRequest)(createStore);

let postLog = (x, y, z) => {

  let id_token = localStorage.getItem("id_token");

  if (id_token) {
    axios({
      baseURL: logUrl,
      url: 'log',
      method: 'post',
      data: {
        data: x,
        context: navigator.userAgent,
        level: y || z
      },
      headers: {
        Authorization: id_token
      }
    })
  };
}

let consoleErr = console.error;
console.error = (x, y, z) => {
  consoleErr(x, y, z);
  postLog(x, y, 'error');
}

let consoleLog = console.log;
console.log = (x, y, z) => {
  consoleLog(x, y, z);
  postLog(x, y, 'debug');
}

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
  , document.querySelector('.container'));


String.prototype.trunc = String.prototype.trunc ||
  function (n) {
    return (this.length > n) ? this.substr(0, n - 1) + '...' : this;
  };

