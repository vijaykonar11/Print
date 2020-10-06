import React, { Component } from 'react';
import { Container, Grid, Card, Button, Icon, Segment, Header, Label, Message } from 'semantic-ui-react'
import { connect } from 'react-redux'

import PrinterCard from '../components/printer-card'
import PrintHubTopBar from '../containers/printhub-top-bar'
import { getPrintHub, loadUserAccount, isConnected, hubRestart } from '../actions/index'
import { UPLOAD_ERROR, UPLOAD_IN_PROGRESS, HUB_DISCONNECTED, HUB_CONNECTED } from '../actions'

class PrintHubHome extends Component {

    componentDidMount() {
        let triggerGetPrintHub = (function () {
            if (this.props.tokens.id_token) {
                this.props.getPrintHub();
//                this.props.getHubOrders();
                this.props.loadUserAccount();
            }
        }).bind(this);

        setTimeout(triggerGetPrintHub, 1000);

        this.props.isConnected();
        setInterval(this.props.isConnected, 10 * 1000);
    }

    render() {
        const printHubs = this.props.printHubs;
        return (
            <div>
                <PrintHubTopBar></PrintHubTopBar>
                <Grid stackable>
                    <Grid.Column
                        textAlign="center"
                        largeScreen={4}>
                        <Header as='h3'
                            color={ this.props.localHub.status == HUB_DISCONNECTED ? 'red' : 'green'}>
                            {this.props.localHub.status}
                        </Header>

                        { this.props.localHub.status == HUB_CONNECTED ? 
                        (<Button color='red' 
                            onClick={this.props.hubRestart}>
                            RESTART
                            </Button>) : '' }

                        { this.props.localHub.status == HUB_CONNECTED ? 
                        (<Button color='red' 
                            onClick={ () => this.props.hubRestart(this.props.tokens) }>
                            REGISTER
                            </Button>) : '' }
                        
                        { this.props.localHub.status == HUB_DISCONNECTED ? 
                        (<Button color='green' as='a' href='printlele-hub-client.zip'>
                            DOWNLOAD CLIENT
                            </Button>) : '' }                        

                        <Header as='h3'>Printers</Header>

                        <Label
                            color="green"
                            as="label"
                            htmlFor="addPrinter"
                            size="big">
                            <Icon name="upload" />
                            Add Printer
                        <input
                                hidden
                                id="addPrinter"
                                type="submit"
                            />
                        </Label>

                    </Grid.Column>
                    <Grid.Column
                        computer={12}
                        mobile={16}
                        tablet={16}>
                        {printHubs ? (printHubs.length == 0) ? (
                            <Segment basic textAlign="center">
                                <Header as="h2" > You do not have any Print Hubs. </Header>
                            </Segment>
                        ) : printHubs.map((printHub) => {
                            return (
                                <Segment basic key={printHub.id}>
                                    <Header>
                                        {printHub.alias} - 
                                        {printHub.printers ? printHub.printers.length : 0} 
                                        printers
                                    </Header>
                                    <Card.Group>
                                        {printHub.printers ? (printHub.printers.length == 0 ? (
                                            <Segment basic textAlign="center">
                                                <Header as="h2" >
                                                    You do not have any printers.
                                                </Header>
                                            </Segment>
                                        ) : printHub.printers.map((printer) => {
                                            return <PrinterCard
                                                printer={printer}
                                                key={printer.alias} />;
                                        })
                                        ) : (
                                                <Container textAlign='center' fluid>
                                                    <Icon name='circle notched' loading size='big' />
                                                    Loading your printers...
                                        </Container>
                                            )
                                        }
                                    </Card.Group>
                                </Segment>
                            )
                        }) : <div>Loading Printhubs...</div>
                        }
                    </Grid.Column>
                </Grid>
            </div>
        );
    }

}

function mapStateToProps(state) {
    return {
        tokens: state.Tokens,
        printHubs: state.MyPrintHubs,
        localHub: state.LocalHub
    }
}

export default connect(mapStateToProps, { getPrintHub, loadUserAccount, isConnected, hubRestart })(PrintHubHome);