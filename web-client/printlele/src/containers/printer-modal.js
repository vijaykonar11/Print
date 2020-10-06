import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Header, Image, Modal, Icon, Segment, Item, Form, Checkbox, Divider } from 'semantic-ui-react'
import { Tab } from 'semantic-ui-react'
import _ from 'lodash'

class PrinterModal extends Component {

    render() {
        let printer = this.props.printer;

        return (
            <Modal size="tiny" closeIcon trigger={
                <Button color='teal' labelPosition='right' icon floated='right'>
                    Edit
                    <Icon name="edit" />
                </Button>
            }>
                <Modal.Header>{printer.name}</Modal.Header>
                <Modal.Content>
                    <Segment basic>
                        <Form>
                            <Form.Group widths='equal'>
                                <Form.Input
                                    label='Name'
                                    value={printer.name}
                                    placeholder='Printer Name' />
                            </Form.Group>
                            <Form.Group widths='equal'>
                                <Form.Input
                                    label='Alias'
                                    value={printer.alias}
                                    placeholder='Printer Alias' />
                            </Form.Group>
                        </Form>
                    </Segment>
                </Modal.Content>
            </Modal>
        )
    }
}

function mapStateToProps(state) {
    return {
        hubOrders: state.HubOrders
    };
}

export default connect(mapStateToProps, null)(PrinterModal); 