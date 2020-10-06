import React, { Component } from 'react';
import { List, Segment, Header, Container, Icon, Grid, Button, Table } from 'semantic-ui-react'
import { connect } from 'react-redux'
import moment from 'moment'
import QRCode from 'qrcode.react'

import TopBar from './top-bar'
import { loadTransactions, loadUserAccount } from '../actions'

let transactionLoadCount = 10;

class UserAccount extends Component {

    constructor(props) {
        super(props);

        this.loadMoreTransactions = this.loadMoreTransactions.bind(this)
    }

    componentDidMount() {
        document.title = "Account";

        this.props.loadTransactions({ count: transactionLoadCount });
        this.props.loadUserAccount();
    }

    loadMoreTransactions() {
        let lastKey = this.props.transactions.LastEvaluatedKey;

        if (lastKey) {
            let lk = {
                lk_date: lastKey.dateTime,
                count: transactionLoadCount
            };

            this.props.loadTransactions(lk);
        } else {
            console.log("No more transaction")
            console.log(this.props.transactions);
        }
    }

    render() {

        if(!this.props.account){
            return (
                <div>
                    <TopBar></TopBar>
                    <Container>
                        <Container textAlign='center' fluid>
                            <Icon name='circle notched' loading size='big' />
                            Loading your account...
                        </Container>                        
                    </Container>
                </div>
            );
        }

        let transactions = this.props.transactions.Items;
        let balance = parseFloat(this.props.account.balance);
        let oldBalance = parseFloat(balance);

        let qrValue = 'http://printlele.com/top-up?user=' + this.props.account.userId;

        return (
            <div>
                <TopBar></TopBar>
                <Container>
                    <Grid celled>
                        <Grid.Row>
                            <Grid.Column>
                                <Header>{this.props.account.userId}</Header>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={8}>
                                <QRCode value={qrValue} />
                            </Grid.Column>
                            <Grid.Column width={8}>
                                Use this QR code to top up your account or buy QR code at Authorized vendors. <a href='/authorized-vendors'>Click here</a> to get list of Authorized vendor near you.
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    {
                        transactions ? transactions.length == 0 ?
                            <Segment basic>
                                You dont have any transactions
                    </Segment> :
                            (
                                <Table striped>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Date</Table.HeaderCell>
                                            <Table.HeaderCell>Info</Table.HeaderCell>
                                            <Table.HeaderCell textAlign='right'>Amount</Table.HeaderCell>
                                            <Table.HeaderCell textAlign='right'>Balance</Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {transactions.map((transaction, i) => {
                                            oldBalance = parseFloat(balance);
                                            balance = parseFloat(balance) - parseFloat(transaction.amount);
                                            return (
                                                <Table.Row key={transaction.dateTime}>
                                                    <Table.Cell>
                                                        {moment(transaction.dateTime).format('DD-MM-YYYY hh:mm A')}
                                                    </Table.Cell>
                                                    <Table.Cell>{transaction.comment}</Table.Cell>
                                                    <Table.Cell textAlign='right'>
                                                        {transaction.amount}
                                                    </Table.Cell>
                                                    <Table.Cell textAlign='right'>
                                                        {oldBalance}
                                                    </Table.Cell>
                                                </Table.Row>
                                            );
                                        })}
                                    </Table.Body>
                                </Table>

                            ) : (
                                <Container textAlign='center' fluid>
                                    <Icon name='circle notched' loading size='big' />
                                    Loading your transaction...
                                </Container>
                            )
                    }
                    {this.props.transactions.LastEvaluatedKey ?
                        <Segment basic textAlign='center'>
                            <Button onClick={this.loadMoreTransactions} >Load More</Button>
                        </Segment> :
                        ''}


                </Container>
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        transactions: state.Transactions,
        account: state.UserAccount
    };
}


export default connect(mapStateToProps, { loadTransactions, loadUserAccount })(UserAccount);