import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  View
} from 'react-native';
import { Root } from 'native-base'
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxPromise from 'redux-promise'
import ReduxThunk from 'redux-thunk'
import { StackNavigator } from 'react-navigation'

import reducers from './reducers';
import AddTokenToRequest from './middleware/add-token-to-request'
import Home from './containers/home'
import LandingPage from './components/landing-page'

const AppNavigator = StackNavigator(
  {
    Home: { screen: Home },
    Login: { screen: LandingPage }
  }
);

const createStoreWithMiddleware = applyMiddleware(ReduxThunk, ReduxPromise, AddTokenToRequest)(createStore);

const store = createStoreWithMiddleware(reducers);

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Root>
          <AppNavigator/>
        </Root> 
      </Provider>
    );
  }
}
