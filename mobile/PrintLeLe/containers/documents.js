import React, { Component } from 'react';
import { connect } from 'react-redux'

import DocumentCard from '../components/document-card'
import UploadingSegment from '../components/uploading-segment'
import { getDocuments, uploadDocument } from '../actions/index'
import { UPLOAD_ERROR, UPLOAD_IN_PROGRESS } from '../actions'

class DocumentList extends Component {

    constructor(props) {
        super(props)

        this.selectedFiles = null
    }

    componentDidMount() {
        let triggerGetDocuments = (function(){
            if(this.props.tokens.id_token)
                this.props.getDocuments();
        }).bind(this);

        setTimeout(triggerGetDocuments,1000);
    }

    fileSelected(selectedFiles) {
        for (let i = 0; i < selectedFiles.length; i++) {
            this.props.uploadDocument(selectedFiles[i]);
        }
    }

    render() {
        const documents = this.props.documents;
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

export default connect(mapStateToProps, { getDocuments, uploadDocument })(DocumentList);