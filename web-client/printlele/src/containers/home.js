import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import TopBar from '../containers/top-bar'
import DocumentList from '../containers/documents'
import { retrieveToken } from '../actions/index'
import { loginPage } from '../config'
import queryString from 'query-string';

class Home extends Component {

  constructor(props){
    super(props)
    
    if(!this.props.tokens.id_token){
      let params = queryString.parse(this.props.location.search)

      if(params.code)
        this.props.retrieveToken(params.code)
      else{
        window.location = loginPage;
      }
    }
  }

  componentDidMount(){
    document.title = "PrintLeLe Home";
  }

  render() {
    return (
      <div>
        <TopBar></TopBar>
        <DocumentList></DocumentList>
      </div>
    );
  }
}

function mapStateToProps(state){
  return {
    tokens: state.Tokens
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators( { retrieveToken }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));