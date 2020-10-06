import React, { Component } from 'react';
import { Card, Button, Icon } from 'semantic-ui-react'
import { connect } from 'react-redux'

import PrinterModal from '../containers/printer-modal'

const isMobile = window.innerWidth <= 500;

export default class PrinterCard extends Component {

    render() {
        let printer = this.props.printer;
        return (
            <Card fluid={isMobile}>
                <Card.Content>
                    <Card.Header>
                        {printer.alias}
                    </Card.Header>
                    <Card.Meta>
                        {printer.name}
                    </Card.Meta>
                </Card.Content>
                <Card.Content extra>
                    <PrinterModal printer={printer}/>
                </Card.Content>
            </Card>
        );
    }
}
