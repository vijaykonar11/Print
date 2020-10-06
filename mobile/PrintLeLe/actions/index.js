import axios from 'axios'
import uuid from 'uuid'
import { AsyncStorage } from 'react-native'

import { clientId, redirectUrl, tokenUrl, docUrl } from '../config'

export const RETRIEVE_TOKEN = 'RETRIEVE_TOKEN';
export const LOAD_DOCUMENTS = 'LOAD_DOCUMENTS';
export const UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENTS';
export const DELETE_DOCUMENT = 'DELETE_DOCUMENT';
export const UPDATE_UPLOAD_DOCUMENT_STATUS = 'UPDATE_UPLOAD_DOCUMENT_STATUS';
export const UPLOAD_ERROR = 'Error';
export const UPLOAD_IN_PROGRESS = 'Uploading';
export const LOGOUT = 'LOGOUT';

export function retrieveToken(code) {

    if (code) {
        return {
            type: RETRIEVE_TOKEN,
            payload: axios.post(tokenUrl + '?grant_type=authorization_code&client_id=' + clientId + '&code=' + code + '&redirect_uri=' + redirectUrl)
        }
    }

    return {
        type: RETRIEVE_TOKEN,
        payload: null
    }
}

export function getDocuments() {
    return {
        type: LOAD_DOCUMENTS,
        payload: {
            fn: axios.get,
            url: docUrl('documents')
        }
    }
}

export function deleteDocument(id) {
    return {
        type: DELETE_DOCUMENT,
        payload: {
            fn: axios.delete,
            url: docUrl('documents/' + id)
        }
    }
}

function getBase64(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            let complete = reader.result;
            let base64 = complete.substring(complete.indexOf("base64") + 7);
            resolve(base64);
        };
        reader.onerror = function (error) {
            reject('Error: ', error);
        };
    });
}


export const uploadDocument = (file) => (dispatch) => {
    console.log(file);
    let fileName = file.name;
    let clientFileId = uuid();

    getBase64(file)
        .then((base64string) => {
            let fileType = fileName.split(".")[fileName.split(".").length - 1]

            let body = {
                base64string,
                fileName,
                fileType,
                clientFileId
            }

            console.log();

            let action = {
                type: UPLOAD_DOCUMENT,
                payload: {
                    fn: axios.post,
                    url: docUrl('documents'),
                    data: body
                }
            }

            dispatch(action);

            action = {
                type: UPDATE_UPLOAD_DOCUMENT_STATUS,
                payload: {
                    clientFileId,
                    fileName,
                    status: UPLOAD_IN_PROGRESS
                }
            }

            dispatch(action);
        })
        .catch((error) => {
            dispatch({
                type: UPDATE_UPLOAD_DOCUMENT_STATUS,
                payload: {
                    clientFileId,
                    fileName,
                    status: UPLOAD_ERROR,
                    error
                }
            });
        });
};

export function logout() {
    try {
        AsyncStorage.removeItem("id_token");
        AsyncStorage.removeItem("refresh_token");
        AsyncStorage.removeItem("access_token");
        AsyncStorage.removeItem("token_ts");
    } catch (error) {
        console.log(error)
        return {
            type: LOGOUT
        };
    }

    return {
        type: LOGOUT
    };
}
