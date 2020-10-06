import React, { Component } from 'react';
import { List, Segment, Header, Container, Icon, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import axios from 'axios'

import { orderCheckout, loadJob } from '../actions'
import { hubUrl } from '../config'

class DocumentOrders extends Component {

    componentDidMount() {
        if (this.props.orders) {
            let documentOrders = this.props.orders;
            let document = this.props.document;

            documentOrders = _.filter(documentOrders, (order) => {
                return order.documentId[0] == document.id;;
            });

            documentOrders.map((order) => {
                if(!order.job || order.job.error)
                    this.props.loadJob(order);
            });
        }
    }

    printNow(order) {
        this.props.orderCheckout(order.id);
    }

    render() {

        let documentOrders = this.props.orders;
        let document = this.props.document;

        documentOrders = _.filter(documentOrders, (order) => {
            return order.documentId[0] == document.id;
        });

        documentOrders = _.sortBy(documentOrders, (order) => {
            return order.status[order.status.length - 1].time;
        });

        documentOrders = _.reverse(documentOrders);

        return (
            <Segment basic>
                {
                    documentOrders ? (documentOrders.length == 0 ? (
                        <Segment basic textAlign="center">
                            <Header as="h3" > You do not have any pending orders for this document. </Header>
                        </Segment>
                    ) : documentOrders.map((order) => {
                        if (!order.job)
                            return (<Container textAlign='center' fluid key={order.id}>
                                <Icon name='circle notched' loading size='big' />
                                Loading order job info...
                            </Container>)
                        else
                            return (
                                <List divided relaxed key={order.id}>
                                    <List.Item>
                                        <List.Content floated='right'>
                                        {
                                            order.status[order.status.length - 1].value == 'pending' ?
                                            <Button
                                                onClick={() => this.printNow(order)}>
                                                Print Now
                                            </Button>:<div/>
                                        }
                                        </List.Content>
                                        <List.Content>
                                            <List.Header>
                                                Print {order.job.noOfCopies} copies at {order.job.printerAlias}
                                            </List.Header>
                                            <List.Description>
                                                {order.job.status[order.job.status.length - 1].value} 
                                                ({order.job.status[order.job.status.length - 1].time})
                                            </List.Description>
                                        </List.Content>
                                    </List.Item>
                                </List>
                            );
                    })) : (
                            <Container textAlign='center' fluid>
                                <Icon name='circle notched' loading size='big' />
                                Loading your orders...
                            </Container>
                        )}
            </Segment>
        );
    }

}

function mapStateToProps(state) {
    return {
        tokens: state.Tokens,
        orders: state.Orders
    };
}


export default connect(mapStateToProps, { orderCheckout, loadJob })(DocumentOrders);