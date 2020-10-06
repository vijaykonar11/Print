import React, { Component } from 'react';
import { Card, Button, Icon } from 'semantic-ui-react'
import { connect } from 'react-redux'
import axios from 'axios'

import PrintModal from '../containers/print-modal'
import { deleteDocument } from '../actions/index'
import { docUrl } from '../config'

const isMobile = window.innerWidth <= 500;

class DocumentCard extends Component {

    downloadDocument(id){

        console.log('downloading: ' + id);

        axios({
            baseURL: docUrl,
            url: 'documents/' + id,
            method: 'get',
            headers: {
                Authorization: this.props.tokens.id_token
            }
        }).then( (response) => {
            if(response.data.Item){
                let downloadUrl = response.data.Item.downloadUrl;
                window.location = downloadUrl;
            }
        }).catch( (error) => {
            console.error(error);
        });
    }

    render() {
        let document = this.props.document;
        let token = this.props.token;
        return (
            <Card fluid={isMobile}>
                <Card.Content>
                    <Button icon floated='right' inverted 
                        color='red' size="tiny" 
                        onClick={ () => this.props.deleteDocument(document.id) }>
                        <Icon name="trash outline" size="large" />
                    </Button> 
                    <Card.Header>
                        {document.alias.trunc(25)}
                    </Card.Header>
                    <Card.Meta>
                        {document.uploadDate}
                    </Card.Meta>
                    <Card.Description>
                        {document.description}
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                     <Button color='teal' labelPosition="right" icon
                        onClick={ () => this.downloadDocument(document.id)}>
                        Download
                        <Icon name="download" />
                    </Button> 
                    <PrintModal document={document} token={token}/>
                </Card.Content>
            </Card>
        );
    }
}

function mapStateToProps(state) {
    return {
        tokens: state.Tokens
    };
}

export default connect(mapStateToProps, { deleteDocument })(DocumentCard);