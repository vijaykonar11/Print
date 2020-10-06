import { LOAD_DOCUMENTS, UPLOAD_DOCUMENT, DELETE_DOCUMENT } from '../actions'

export default function (state = null, action) {
    switch(action.type){
        case LOAD_DOCUMENTS:
            return action.payload.data.Items;
        case UPLOAD_DOCUMENT:
            if(action.payload.status != 200)
                return state;
            
            let documents = state.slice();
            let newDoc = action.payload.data;
            documents.unshift(newDoc);
            return documents;
        case DELETE_DOCUMENT:
            if(action.payload.status != 200)
                return state;
        
            documents = state.slice();
            let deletedDoc = action.payload.data.Attributes;
            for(let i = 0; i < documents.length; i++){
                if(documents[i].id == deletedDoc.id)
                    documents.splice(i, 1);
            }

            return documents;
    }
    return state;
}  