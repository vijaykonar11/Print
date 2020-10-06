import React, { Component } from 'react'
import { Segment, Message } from 'semantic-ui-react'

import { UPLOAD_IN_PROGRESS, UPLOAD_ERROR } from '../actions/index'

class UploadingSegment extends Component {

    render() {
        return (
            <Segment basic>
                {this.props.uploadDocuments ? this.props.uploadDocuments.map((document) => {
                    if (document)
                        return (
                            <Message
                                info={document.status == UPLOAD_IN_PROGRESS}
                                success={document.status == "COMPLETE"}
                                error={document.status == UPLOAD_ERROR}
                                key={document.clientFileId}>
                                <Message.Header>{document.fileName}</Message.Header>
                                <p>{
                                    document.status == UPLOAD_IN_PROGRESS ? "Uploading" : (document.status == "COMPLETE" ? "Upload complete" : "Upload failed!")
                                }</p>
                            </Message>
                        )
                    else return "";
                }) : "No documents uploading"}
            </Segment>
        )
    }
}

export default UploadingSegment;