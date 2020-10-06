import React, { Component } from 'react';
import { connect } from 'react-redux'

import PrintQRModal from './print-qr-modal'
import { deleteDocument } from '../actions/index'

const isMobile = window.innerWidth <= 500;

class DocumentCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            document: props.document,
            token: props.token
        }
    }

    render() {
        let document = this.state.document;
        let token = this.state.token;
        return (
            <Card>
                <CardItem header>
                    <Body>
                        <Text>{document.alias.trunc(25)}</Text>
                        <Text note>{document.uploadDate}</Text>
                        <Text>{document.description}</Text>
                    </Body>
                    <Right>
                        <Button icon danger onPress={() => this.props.deleteDocument(document.id)}>
                            <Icon name='trash' />
                        </Button>
                    </Right>
                </CardItem>
                <CardItem button>
                    <Left>
                        <Button iconLeft primary onPress={() => alert("This is Card Body")}>
                            <Icon name='download' />
                            <Text>View</Text>
                        </Button>
                    </Left>
                    <Body>
                    </Body>
                    <Right>
                        <PrintQRModal document={document} token={token} />
                    </Right>
                </CardItem>
            </Card>
        );
    }
}

export default connect(null, { deleteDocument })(DocumentCard);