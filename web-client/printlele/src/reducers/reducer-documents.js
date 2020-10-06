import _ from 'lodash'

import { LOAD_DOCUMENTS, UPLOAD_DOCUMENT, DELETE_DOCUMENT } from '../actions'

export default function (state = {}, action) {
    switch (action.type) {
        case LOAD_DOCUMENTS:

            if (action.payload.data) {
                let newDocuments = action.payload.data;

                if (state.Items) {
                    newDocuments.Items = _.concat(state.Items, newDocuments.Items);
                    return newDocuments;
                }
                else
                    return newDocuments;
            }
        case UPLOAD_DOCUMENT:
            if (action.payload.status != 200)
                return state;

            let documents = Object.assign({}, state);
            let newDoc = action.payload.data;
            documents.Items.unshift(newDoc);
            return documents;
        case DELETE_DOCUMENT:
            if (action.payload.status != 200)
                return state;

            documents = Object.assign({}, state);
            let deletedDoc = action.payload.data.Attributes;
            for (let i = 0; i < documents.Items.length; i++) {
                if (documents.Items[i].id == deletedDoc.id)
                    documents.Items.splice(i, 1);
            }

            return documents;
    }
    return state;
}  