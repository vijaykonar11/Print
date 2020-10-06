import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Home from '../containers/home'
import LandingPage from '../components/landing-page'
import PrintHubHome from '../containers/print-hub-home'
import UserAccount from '../containers/user-account'
import TopUpPage from '../containers/top-up-page'

import startTokenRefresher from './token-refresher'

class App extends Component {

  constructor(props){
    super(props);

    startTokenRefresher();
  }

  render() {
    return (
        <Switch>
          <Route exact path='/' component={LandingPage}/>
          <Route path='/home' component={Home}/>
          <Route path='/print-hub' component={PrintHubHome}/>
          <Route path='/user-account' component={UserAccount}/>
          <Route path='/top-up' component={TopUpPage}/>
        </Switch>
    );
  }
}

export default withRouter(App);