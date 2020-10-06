import React, { Component } from 'react';
import { Form, Checkbox, Divider, Segment, Tab, Icon, Message, Modal, Button, Container } from 'semantic-ui-react'
import { connect } from 'react-redux'
import axios from 'axios'
import _ from 'lodash'

import {
    printNow, printLater, updateUserAccount, loadPrintHubs,
    UPLOAD_ERROR, UPLOAD_IN_PROGRESS
} from '../actions'
import { hubUrl } from '../config'
import PrinterStatus from './printer-status'

let PRINTER_NOT_FOUND = 'PRINTER_NOT_FOUND';
let PRINTER_INFO_LOADING = 'PRINTER_INFO_LOADING';
let PRINTER_FOUND = 'PRINTER_FOUND';
let ERROR = 'ERROR';

class OrderPrint extends Component {

    constructor(props) {
        super(props)

        this.state = {
            noOfCopies: 1,
            printerAlias: '',
            selectedType: 'bw',
            printerDefault: true,
            printerHub: { status: PRINTER_INFO_LOADING },
            orderCost: {},
            printerAvailable: false
        };

        this.onPrinterChange = this.onPrinterChange.bind(this);
        this.onPrintTypeChange = this.onPrintTypeChange.bind(this);
        this.onNoOfCopiesChange = this.onNoOfCopiesChange.bind(this);
        this.orderPrintNow = this.orderPrintNow.bind(this);
        this.orderPrintLater = this.orderPrintLater.bind(this);
        this.onDefaultPrinterChange = this.onDefaultPrinterChange.bind(this);
        this.updateDefaultPrinter = this.updateDefaultPrinter.bind(this);
        this.getPrinterHubByAlias = _.debounce(this.getPrinterHubByAlias, 300).bind(this);
        this.setPrinterAvailability = this.setPrinterAvailability.bind(this);
    }

    componentDidMount() {
        let defaultPrinter = '';

        // See if user already have a default printer, and set it as default
        if (this.props.userAccount && this.props.userAccount.defaultPrinter)
            defaultPrinter = this.props.userAccount.defaultPrinter;

        this.setState({
            noOfCopies: 1,
            printerAlias: defaultPrinter,
            selectedType: 'bw',
            printerHub: { status: PRINTER_INFO_LOADING },
            printerDefault: true,
            orderCost: {}
        });

        if (defaultPrinter != '')
            this.getPrinterHubByAlias(defaultPrinter);

        // Load all available printers in system
        this.props.loadPrintHubs();
    }

    /**
     * If default printer is changed on user account load complete, update it in state.
     * @param {*} prevProps 
     */
    componentDidUpdate(prevProps) {
        if (this.props.userAccount && prevProps.userAccount &&
            prevProps.userAccount.defaultPrinter !== this.props.userAccount.defaultPrinter) {
            let state = Object.assign({}, this.state);
            state.printerAlias = this.props.userAccount.defaultPrinter;
            this.setState(state);
        }
    }

    /**
     * On Printer Select drop down change, get new printerAlias's hub.
     * @param {*} e 
     * @param {*} param1 
     */
    onPrinterChange(e, { value }) {
        let printerAlias = value;
        let state = Object.assign({}, this.state);
        state.printerAlias = printerAlias;
        this.setState(state);

        this.getPrinterHubByAlias(printerAlias);
    }

    /**
     * Get Print Hub object based on printer Alias 
     * @param {*} printerAlias 
     */
    getPrinterHubByAlias(printerAlias) {

        let state = Object.assign({}, this.state);
        state.printerHub = { status: PRINTER_INFO_LOADING };
        this.setState(state);

        axios({
            baseURL: hubUrl,
            url: `print-hub/by-alias/printer/${printerAlias}`,
            method: 'get',
            headers: {
                Authorization: this.props.tokens.id_token
            }
        }).then((response) => {
            let state = Object.assign({}, this.state);

            if (response.data.Item) {
                state.printerHub = response.data.Item;
                state.printerHub.status = PRINTER_FOUND

                // Convert array object to key to printer object
                state.printerHub.printers = _.keyBy(state.printerHub.printers, 'alias');
                let cost = state.printerHub.printers[printerAlias].cost;

                // Populate printer options based on the selected printer
                state.printerOptions = [];
                for (let i = 0; i < cost.length; i++) {
                    switch (cost[i].colorType) {
                        case 'bw':
                            state.printerOptions.push({ key: 'bw', text: 'Black & White (A4 size)', value: 'bw' });
                            break;
                        case 'color':
                            state.printerOptions.push({ key: 'color', text: 'Color (A4 size)', value: 'color' });
                            break;
                        case 'photo':
                            state.printerOptions.push({ key: 'photo', text: 'Photo (4\'\' x 6\'\')', value: 'photo' });
                            break;
                    }
                }

                // Default the selected printer to first available one
                state.selectedType = state.printerOptions[0].key;
            }
            else {
                state.printerHub = { status: PRINTER_NOT_FOUND };
            }

            let order = this.orderObject();
            order.printerAlias = printerAlias;
            order.selectedType = state.selectedType;

            state.orderCost = this.getCalculatedCost(state.printerHub, order, this.props.document.pageCount);
            this.setState(state);
        }).catch((error) => {
            console.log(error);
            let state = Object.assign({}, this.state);
            //            state.printerHub = { status: ERROR };
            state.printerHub = { status: PRINTER_NOT_FOUND };
            state.orderCost = {};
            state.printerOptions = [];
            this.setState(state);
        });
    }

    /**
     * Use printer cost value from PrintHub's printer, number of copies and 
     * page counts per document
     * @param {*} printerHub 
     * @param {*} param1 
     * @param {*} pageCount 
     */
    getCalculatedCost(printerHub, { selectedType, noOfCopies, printerAlias }, pageCount) {
        if (!printerHub)
            return {};

        let printer;
        let costPerPage;

        printer = printerHub.printers[printerAlias];

        // Select cost of the selected print type option
        for (let i = 0; i < printer.cost.length; i++)
            if (printer.cost[i].colorType === selectedType)
                costPerPage = printer.cost[i].costPerPage;

        if (!noOfCopies)
            noOfCopies = 0;

        let totalCost = parseInt(noOfCopies) * parseFloat(costPerPage) * parseInt(pageCount);

        return { noOfCopies, costPerPage, pageCount, totalCost };
    }

    onPrintTypeChange(e, { value }) {
        console.log(value);
        let state = Object.assign({}, this.state);
        state.selectedType = value;

        let order = this.orderObject();
        order.selectedType = value;
        state.orderCost = this.getCalculatedCost(state.printerHub, order, this.props.document.pageCount);
        this.setState(state);
    }

    onNoOfCopiesChange(e) {
        let noOfCopies = e.target.value;
        let state = Object.assign({}, this.state);
        state.noOfCopies = noOfCopies;

        let order = this.orderObject();
        order.noOfCopies = noOfCopies;
        state.orderCost = this.getCalculatedCost(state.printerHub, order, this.props.document.pageCount);
        this.setState(state);
    }

    onDefaultPrinterChange(e, val) {
        let printerDefault = val.checked;
        let state = Object.assign({}, this.state);
        state.printerDefault = printerDefault;
        this.setState(state);
    }

    /**
     * 
     * @param {*} confirmed this variable tells if the user has already confirmed on dialog
     */
    orderPrintNow(confirmed) {
        if (this.state.printerHub.status != PRINTER_FOUND)
            return;

        let state = Object.assign({}, this.state);

        if (confirmed == true) {
            state.confirmCheckout = false;
            let orderRequest = this.orderObject();
            this.props.printLater(orderRequest, true);
            this.updateDefaultPrinter();
        } else {
            state.confirmCheckout = true;
        }
        this.setState(state);
    }

    orderPrintLater() {
        if (this.state.printerHub.status != PRINTER_FOUND)
            return;

        let orderRequest = this.orderObject();
        this.props.printLater(orderRequest);
        this.updateDefaultPrinter();
    }

    orderObject() {
        return {
            selectedType: this.state.selectedType,
            noOfCopies: this.state.noOfCopies,
            printerAlias: this.state.printerAlias,
            documentId: this.props.document.id
        };
    }

    updateDefaultPrinter() {
        if (this.state.printerDefault && this.props.userAccount &&
            this.state.printerAlias != this.props.userAccount.defaultPrinter) {
            let account = Object.assign({}, this.props.userAccount);
            account.defaultPrinter = this.state.printerAlias;
            this.props.updateUserAccount(account)
        }
    }

    setPrinterAvailability(available) {
        let state = Object.assign({}, this.state);
        state.printerAvailable = available;
        this.setState(state);
    }

    render() {

        // If User Account details are not loaded yet, don't show anything on Order Print Screen
        if (!this.props.userAccount) {
            return (
                <Container textAlign='center' fluid>
                    <Icon name='circle notched' loading size='big' />
                    Loading your account info...
                </Container>
            );
        }

        let hubs = this.props.printHubs;

        let printers = [];

        if (hubs) {
            for (let i = 0; i < hubs.length; i++) {
                if (hubs[i].printers && hubs[i].printers.length) {
                    for (let j = 0; j < hubs[i].printers.length; j++) {
                        printers.push({
                            key: hubs[i].printers[j].alias,
                            text: hubs[i].alias + ' (' + hubs[i].printers[j].alias + ')',
                            value: hubs[i].printers[j].alias
                        });
                    }
                }
            }
        }

        let newBalance = (this.props.userAccount.balance - this.state.orderCost.totalCost);

        return (
            <Tab.Pane>
                <Segment basic>
                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Select
                                options={printers}
                                value={this.state.printerAlias}
                                onChange={this.onPrinterChange}
                                label='Printer'
                                placeholder='Please select a printer' />

                            {this.state.printerHub.status == PRINTER_FOUND ?
                                <div></div> :
                                this.state.printerHub.status == PRINTER_NOT_FOUND ?
                                    <Segment basic>
                                        Printer Not Found!
                                        <Icon size='large'
                                            name='exclamation triangle'
                                            color='red' />
                                    </Segment> :
                                    this.state.printerHub.status == PRINTER_INFO_LOADING ?
                                        <Segment basic>
                                            <Icon name='circle notched' loading />
                                        </Segment> :
                                        <Segment basic>
                                            <Icon name='close' />
                                            Error loading Printer Info!
                                        </Segment>}
                        </Form.Group>
                        {this.state.printerHub.address ?
                            (<Form.Group>
                                <Container basic textAlign='center'>
                                    <strong>
                                        {this.state.printerHub.address.streetAddress},&nbsp;
                                                {this.state.printerHub.address.city},&nbsp;
                                                {this.state.printerHub.address.state}
                                    </strong>
                                </Container>
                            </Form.Group>) : null
                        }
                        {this.state.printerAlias == '' ? null :
                            (
                                <Form.Group>
                                    <Container basic textAlign="center">
                                        <PrinterStatus
                                            printerAlias={this.state.printerAlias}
                                            printerAvailability={this.setPrinterAvailability}>
                                        </PrinterStatus>
                                    </Container>
                                </Form.Group>
                            )
                        }
                        {
                            this.state.printerHub.status == PRINTER_FOUND && this.state.printerAvailable ?
                                <div>
                                    <Form.Group widths='equal'>
                                        <Form.Checkbox
                                            checked={this.state.printerDefault}
                                            onChange={this.onDefaultPrinterChange}
                                            label='set as default printer' />
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Input
                                            value={this.state.noOfCopies}
                                            onChange={this.onNoOfCopiesChange}
                                            label='Number of Copies'
                                            placeholder='Number of Copies'
                                        />
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        <Form.Select
                                            options={this.state.printerOptions}
                                            value={this.state.selectedType}
                                            onChange={this.onPrintTypeChange}
                                            label='Type'
                                            placeholder='Type' />
                                    </Form.Group>
                                    <Form.Group widths='equal'>
                                        {this.state.printerHub.status == PRINTER_FOUND ?
                                            <Message
                                                color={newBalance < 0 || this.state.orderCost.pageCount < 0 ? 'red' : 'green'}>
                                                {this.state.orderCost.pageCount < 0 ? (
                                                    <div>
                                                        This document type is not supported yet. Please check back later.
                                                    </div>
                                                ) : (
                                                        <div>
                                                            Cost: {this.state.orderCost.pageCount} pages x {this.state.orderCost.noOfCopies} copies x {this.state.orderCost.costPerPage} Rs = <strong> {this.state.orderCost.totalCost} Rs
                                                                {newBalance < 0 ?
                                                                    <div>
                                                                        <p>Insufficient balance! Your balance is {this.props.userAccount.balance} Rs</p>
                                                                        <p>Please top up your account for atleast {this.state.orderCost.totalCost - this.props.userAccount.balance} Rs</p>
                                                                    </div> : ''} </strong>
                                                        </div>
                                                    )}
                                            </Message> :
                                            <Message color='red'>
                                                Invalid printer!
                                            </Message>
                                        }
                                    </Form.Group>
                                    <Divider />
                                    <Form.Group>
                                        {/* <Form.Button
                                            onClick={this.orderPrintLater}>
                                            Print Later
                                        </Form.Button> */}
                                        <Form.Button
                                            disabled={newBalance < 0 || this.state.orderCost.totalCost <= 0 || !this.state.printerAvailable}
                                            onClick={this.orderPrintNow}>
                                            Print Now
                                        </Form.Button>
                                        {(newBalance < 0) ? (
                                            <Button as='a' href='/user-account'>
                                                Top Up
                                            </Button>
                                        ) : <span></span>}
                                    </Form.Group>
                                    <Form.Group>
                                        {this.props.currentOrder.status}
                                    </Form.Group>
                                </div> :
                                null
                        }
                    </Form>

                    <Modal size='mini' open={this.state.confirmCheckout}>
                        <Modal.Header>Print Document Now?</Modal.Header>
                        <Modal.Content>
                            <p>Make sure you are at printer to receive your pages.</p>
                            <p>You will be charged
                                <strong> {this.state.orderCost.totalCost} Rs</strong>.
                            </p>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button negative
                                onClick={() => {
                                    let state = Object.assign({}, this.state);
                                    state.confirmCheckout = false;
                                    this.setState(state);
                                }}>No</Button>
                            <Button positive icon='checkmark'
                                labelPosition='right'
                                content='Yes'
                                onClick={() => this.orderPrintNow(true)} />
                        </Modal.Actions>
                    </Modal>
                </Segment>
            </Tab.Pane>
        );
    }

}

function mapStateToProps(state) {
    return {
        currentOrder: state.CurrentOrder,
        userAccount: state.UserAccount,
        tokens: state.Tokens,
        printHubs: state.PrintHubs
    };
}

export default connect(mapStateToProps, { printNow, printLater, updateUserAccount, loadPrintHubs })(OrderPrint);