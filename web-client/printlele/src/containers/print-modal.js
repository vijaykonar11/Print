import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Header, Image, Modal, Icon, Segment, Item, Form, Checkbox, Divider } from 'semantic-ui-react'
import { Tab } from 'semantic-ui-react'
import QRCode from 'qrcode.react'
import _ from 'lodash'

import OrderPrint from '../containers/order-print'
import DocumentOrders from '../containers/document-orders'

class PrintModal extends Component {

    constructor(props) {
        super(props)

        if (props.document) {
            this.state = {
                document: props.document,
                token: props.token
            }
        }
        else
            this.state = {}
    }

    render() {
        let document = this.state.document;
        let token = this.state.token;

        let qrCodeValue = document.id;

        const panes = [{
            menuItem: 'Order Print',
            render: () => { return <OrderPrint document={document} />; }
        }];
        // , {
        //     menuItem: 'Scan Qr Code',
        //     render: () => {
        //         return (
        //             <Tab.Pane>
        //                 <Item.Group>
        //                     <Item>
        //                         <div className="image">
        //                             <QRCode value={qrCodeValue} />
        //                         </div>
        //                         <Item.Content>
        //                             <Item.Meta>Uploaded at {document.uploadDate}</Item.Meta>
        //                             {document.description ? <Item.Description>{document.description}</Item.Description> : ''}
        //                             <Item.Extra>Scan this qr code at a printing kiosk</Item.Extra>
        //                         </Item.Content>
        //                     </Item>
        //                 </Item.Group>
        //             </Tab.Pane>);
        //     }
        // }

        if (this.props.orders) {
            let documentOrders = this.props.orders;

            //Filter by document and status
            documentOrders = _.filter(documentOrders, (order) => {
//                let lastStatus = order.status[order.status.length - 1];
                return order.documentId[0] == document.id; // && lastStatus.value === 'pending';
            });

            if (documentOrders.length > 0){
                panes.push({
                    menuItem: documentOrders.length + ' orders',
                    render: () => <DocumentOrders document={this.state.document}/>
                });
            }
        }

        return (
            <Modal size="tiny" closeIcon trigger={
                <Button color='teal' labelPosition='right' icon floated='right'>
                    Print
                    <Icon name="print" />
                </Button>
            }>
                <Modal.Header>{document.alias}</Modal.Header>
                <Modal.Content>
                    <Tab panes={panes} />
                </Modal.Content>
            </Modal>
        )
    }
}

function mapStateToProps(state) {
    return {
        orders: state.Orders
    };
}

export default connect(mapStateToProps, null)(PrintModal); 