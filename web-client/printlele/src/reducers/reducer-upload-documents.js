import { UPLOAD_DOCUMENT, UPDATE_UPLOAD_DOCUMENT_STATUS, UPLOAD_ERROR, UPLOAD_IN_PROGRESS } from '../actions'

export default function (state = [], action) {

    let uploading_docs = state.slice();
    switch(action.type){
        case UPLOAD_DOCUMENT:
            uploading_docs = uploading_docs.map((doc) => {
                if(doc.clientFileId == action.payload.data.clientFileId){
                    if(action.payload.status == 200)
                        doc.status = "COMPLETE";
                    else
                        doc.status = UPLOAD_ERROR;
                }
                return doc;
            });

            return uploading_docs;
        case UPDATE_UPLOAD_DOCUMENT_STATUS:
            if(action.payload.status == UPLOAD_ERROR){
                uploading_docs = uploading_docs.map((doc) => {
                    if(doc.clientFileId == action.payload.clientFileId)
                        doc.status = UPLOAD_ERROR;
                });
            } else if(action.payload.status == UPLOAD_IN_PROGRESS){
                uploading_docs.unshift(action.payload);
            }

            return uploading_docs;
    }
    
    return state;
}  