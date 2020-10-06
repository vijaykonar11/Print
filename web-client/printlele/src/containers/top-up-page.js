import React, { Component } from 'react';
import { Segment, Header, Container, Icon, Button, Form } from 'semantic-ui-react'
import { connect } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import queryString from 'query-string';

import { loadUserAccount } from '../actions'
import { accountUrl } from '../config'

let transactionLoadCount = 10;

class TopUpPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            correctAmount: false,
            correctUser: false,
            message: '',
            loading: true
        };

        this.topUp = this.topUp.bind(this);
        this.onCorrectAmountChange = this.onCorrectAmountChange.bind(this);
        this.onCorrectUserChange = this.onCorrectUserChange.bind(this);        
        this.onAmountChange = this.onAmountChange.bind(this);
        this.onUserChange = this.onUserChange.bind(this);
        this.validForm = this.validForm.bind(this);
    }

    componentDidMount() {
        document.title = "Top Up";
        this.props.loadUserAccount();

        if(!this.props.tokens.id_token){
            alert("Please log in first before topping up account.")
            window.location = "/";
        }

        let params = queryString.parse(this.props.location.search)
        let user = params.user;
        let code = params.code;

        if (user) {
            let state = Object.assign({}, this.state);
            state.user = user;
            state.correctUser = true;
            this.setState(state);
        }

        if(code) {
            axios({
                method: 'post',
                baseURL: accountUrl,
                url: 'top-up-account',
                headers: {
                    Authorization: this.props.tokens.id_token
                },
                data: { code }
            }).then( (response) => {
                console.log(response.data);
                if(response.data && response.data.accountUpdateResponse && 
                    response.data.accountUpdateResponse.Attributes && response.data.accountUpdateResponse.Attributes.balance){
                    alert("You account has been topped up with Rs " + response.data.transaction.amount + ".\nNew Account balance: " + response.data.accountUpdateResponse.Attributes.balance);
                    window.location = "/user-account";
                }
                else
                    throw new Error("Some error occured, please contact support if it persist.");
            }).catch( (error) => {
                console.error(error);
                if(error.response && error.response.data && error.response.data.errorMessage)
                    alert("Error: " + error.response.data.errorMessage);
                else
                    alert(error.message);
            });
        }


    }

    topUp(){
        console.log(this.state);

        axios({
            baseURL: accountUrl,
            url: 'top-up-account',
            method: 'post',
            headers: {
                Authorization: this.props.tokens.id_token
            },
            data: {
                comment: 'Top up',
                userId: this.state.user,
                amount: this.state.amount
            }
        }).then((response) => {
            let state = Object.assign({}, this.state);
            if(response.data.updateResponse){
                alert('Top up completed.');
                let newBalance = response.data.updateResponse.Attributes.balance;
                state.message = 'New Account balance: ' + newBalance;
                state.correctAmount = false;
                state.correctUser = false;
                state.amount = '';
                
            } else {
                state.message = 'Some issue occured. Please contact us.';
            }
            this.setState(state);
        }).catch((error) => {
            console.log(error);

            let state = Object.assign({}, this.state);
            if(error.response.data){
                state.message = error.response.data.errorMessage;
            } else {
                state.message = error.message;
            }
            this.setState(state);

        });
    }

    onCorrectAmountChange(e, val){
        let correctAmount = val.checked;
        let state = Object.assign({}, this.state);
        state.correctAmount = correctAmount;
        this.setState(state);
    }

    onCorrectUserChange(e, val){
        let correctUser = val.checked;
        let state = Object.assign({}, this.state);
        state.correctUser = correctUser;
        this.setState(state);
    }

    onAmountChange(e){
        let amount = e.target.value;
        let state = Object.assign({}, this.state);
        state.amount = amount;
        this.setState(state);
    }

    onUserChange(e){
        let user = e.target.value;
        let state = Object.assign({}, this.state);
        state.user = user;
        this.setState(state);
    }

    validForm(){
        if(!this.state.correctAmount)
            return false;
        if(!this.state.correctUser)
            return false;
        if(!this.state.user || this.state.user.trim() == "")
            return false;
        if(!this.state.amount || this.state.amount.trim() == "")
            return false;
        
        return true;
    }

    render() {        
        return (
            <div>
                {this.props.account ? this.props.account.isAuthorizedVendor == "yes" ? (
                <Container>
                    <Segment>
                        <Form>
                            <Form.Group>
                                <Header>Print Le Le top up: {this.state.user}</Header>
                            </Form.Group>
                            <Form.Group>
                                <Form.Input
                                    value={this.state.user}
                                    onChange={this.onUserChange}
                                    label='Top up for user'
                                    placeholder='User Id' />
                                <Form.Checkbox
                                    checked={this.state.correctUser}
                                    onChange={this.onCorrectUserChange}
                                    label='This is correct user!!' />
                            </Form.Group>
                            <Form.Group>
                                <Form.Input
                                    value={this.state.amount}
                                    onChange={this.onAmountChange}
                                    label='Amount'
                                    placeholder='Amount' />
                                <Form.Checkbox
                                    checked={this.state.correctAmount}
                                    onChange={this.onCorrectAmountChange}
                                    label='This is correct amount!!' />
                            </Form.Group>
                            <Form.Group>
                                {this.state.correctAmount}
                                <Form.Button
                                    disabled={!this.validForm()}
                                    onClick={this.topUp}>
                                    Top Up
                                </Form.Button>

                                {this.state.message}
                            </Form.Group>
                        </Form>
                    </Segment>

                </Container>
                ): <Header> Operation not allowed </Header>
                : <Header> Loading account details.. </Header>}
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        account: state.UserAccount,
        tokens: state.Tokens
    };
}


export default connect(mapStateToProps, { loadUserAccount })(TopUpPage);