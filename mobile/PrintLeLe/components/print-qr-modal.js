import React, { Component } from 'react'

class PrintQRModal extends Component {

    constructor(props) {
        super(props)

        if (props.document){
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

        let qrCodeValue = document.id + ":" + token;

        return (
            <Modal size="tiny" closeIcon trigger={
                <Button color='teal' labelPosition='right' icon floated='right'>
                    Print
                    <Icon name="print" />
                </Button>
                }>
                <Modal.Header>{document.alias}</Modal.Header>
                <Modal.Content>
                    <Item.Group>
                    <Item>
                    <div class="image">
                        <QRCode value={qrCodeValue} size="250"/>
                    </div>
                    <Item.Content>
                        <Item.Meta>Uploaded at {document.uploadDate}</Item.Meta>
                        {document.description ? <Item.Description>{document.description}</Item.Description> : '' }
                        <Item.Extra>Scan this qr code at a printing kiosk</Item.Extra>
                    </Item.Content>
                    </Item>
                    </Item.Group>
                </Modal.Content>
            </Modal>
        )
    }
}

export default PrintQRModal