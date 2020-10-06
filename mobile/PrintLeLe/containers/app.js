import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import Home from '../containers/home'
import LandingPage from '../components/landing-page'
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
        </Switch>
    );
  }
}

export default withRouter(App);