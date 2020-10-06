import React, { Component } from 'react';
import { Container, Grid, Card, Button, Icon, Segment, Header, Label, Message } from 'semantic-ui-react'
import { connect } from 'react-redux'

import DocumentCard from '../components/document-card'
import UploadingSegment from '../components/uploading-segment'
import { getDocuments, uploadDocument, getOrders, loadUserAccount } from '../actions/index'
import { UPLOAD_ERROR, UPLOAD_IN_PROGRESS } from '../actions'

let docLoadCount = 30;

class DocumentList extends Component {

    constructor(props) {
        super(props)

        this.selectedFiles = null;
        this.loadMoreDocuments = this.loadMoreDocuments.bind(this)
    }

    componentDidMount() {
        let triggerGetDocuments = (function(){
            if(this.props.tokens.id_token){
                this.props.getDocuments({ count: docLoadCount });
                this.props.getOrders();
                this.props.loadUserAccount();
            } else {
                setTimeout(triggerGetDocuments,2000);
            }
        }).bind(this);

        triggerGetDocuments();
    }

    fileSelected(selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
            let fileName = selectedFiles[i].name;
            let fileType = fileName.split(".")[fileName.split(".").length - 1]

            if(fileType.toLowerCase() == "pdf" || fileType.toLowerCase() == "docx" ){
                this.props.uploadDocument(selectedFiles[i]);
            } else {
                alert("Sorry! only PDF and Microft Word DOCX files supported at this time!");
            }
        }
    }

    loadMoreDocuments(){
        let lastKey = this.props.documents.LastEvaluatedKey;

        if(lastKey){
            let lk = {
                lk_date: lastKey.uploadDate,
                lk_id: lastKey.id,
                count: docLoadCount
            };

            this.props.getDocuments(lk);
        } else {
            console.log("No more docs")
            console.log(this.props.documents);
        }
    }

    render() {
        const documents = this.props.documents.Items;
        const uploadDocuments = this.props.uploadDocuments;

        let uploadingCount = 0;
        let errorCount = 0;

        for(let i = 0; i < uploadDocuments.length; i++){
            switch(uploadDocuments[i].status){
                case UPLOAD_IN_PROGRESS:
                    uploadingCount++;
                    break;
                case UPLOAD_ERROR:
                    errorCount++;
                    break;
            }
        }

        let uploadingMessage = "";

        if(uploadingCount != 0)
            uploadingMessage += uploadingCount + " files uploading. ";
        if(errorCount != 0)
            uploadingMessage += "Error uploading " + errorCount + " files.";

        return (
            <Grid stackable>
                <Grid.Column 
                    textAlign="center"
                    largeScreen={2}>
                    <Header as='h3'>Documents</Header>

                    <Label
                        color="green"
                        as="label"
                        htmlFor="uploadFile"
                        size="big">
                            <Icon name="upload"/>
                            Upload
                        <input
                            hidden
                            id="uploadFile"
                            multiple
                            onChange={() => this.fileSelected(this.uploadFileButton.files)}
                            ref={(input) => this.uploadFileButton = input}
                            type="file"
                        />
                    </Label>
                    <Header as='h5'>PDF and Microsoft Word (DOCX) files only</Header>

                </Grid.Column>
                <Grid.Column 
                    computer={10}
                    mobile={16}
                    tablet={16}>
                    {uploadingMessage == "" ? "" : (
                        <Message 
                            error={errorCount>0}
                            info={errorCount==0}>
                            {uploadingMessage}
                        </Message>
                        )}

                    <Card.Group>
                        {documents ? (documents.length == 0 ? (
                            <Segment basic textAlign="center">
                                <Header as="h2" > Click upload to print your first page! </Header>
                                <Header as="h2" > You do not have any documents. </Header>
                            </Segment>
                            ) : documents.map((document) => {
                            return <DocumentCard 
                                        document={document} 
                                        token={this.props.tokens.id_token}
                                        key={document.id} />;
                        })) : (
                            <Container textAlign='center' fluid>
                                <Icon name='circle notched' loading size='big'/>
                                Loading your documents... 
                            </Container>
                            )}
                    </Card.Group>
                    
                    { this.props.documents.LastEvaluatedKey ? 
                    <Segment basic textAlign='center'>
                        <Button onClick={this.loadMoreDocuments} >Load More</Button>
                    </Segment>:
                        '' }
                    
                </Grid.Column>
                <Grid.Column 
                    only='large screen' 
                    largeScreen={4}>
                    <UploadingSegment uploadDocuments={uploadDocuments} />
                </Grid.Column>
            </Grid>
        );
    }

}

function mapStateToProps(state) {
    return {
        documents: state.Documents,
        tokens: state.Tokens,
        uploadDocuments: state.UploadDocuments
    }
}

export default connect(mapStateToProps, { 
    getDocuments, uploadDocument, getOrders, loadUserAccount })(DocumentList);