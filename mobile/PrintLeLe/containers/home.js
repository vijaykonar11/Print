import React, { Component } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Container, Content, Body, Button, Icon, Text } from 'native-base'

import TopBar from '../containers/top-bar'
//import DocumentList from '../containers/documents'
import { retrieveToken } from '../actions/index'
import { loginPage } from '../config'

class Home extends Component {

  constructor(props){
    super(props)
    
    if(!this.props.tokens.id_token){
      let params = {
        code: '01e2a26d-e899-470f-ad21-6ca2e2ed5ddb'
      };

      console.log(params);

      if(params.code){
        console.log('retriving token');
        this.props.retrieveToken(params.code)
      }
      else{
        window.location = loginPage;
      }
    }
  }

  render() {
    return (
      <Container>
        <TopBar/>
        <Content padder>

          <Content padder>
            <Body>
            <Button iconLeft >
              <Icon name='arrow-up' />
              <Text> Upload </Text>
            </Button>
            </Body>
          </Content>

        </Content>
      </Container>
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

export default connect(mapStateToProps, mapDispatchToProps)(Home);