import axios from 'axios'
import uuid from 'uuid'

import { clientId, redirectUrl, tokenUrl, docUrl, hubUrl, accountUrl, hubAdminUrl } from '../config'

export const RETRIEVE_TOKEN = 'RETRIEVE_TOKEN';
export const LOAD_DOCUMENTS = 'LOAD_DOCUMENTS';
export const UPLOAD_DOCUMENT = 'UPLOAD_DOCUMENTS';
export const DELETE_DOCUMENT = 'DELETE_DOCUMENT';
export const UPDATE_UPLOAD_DOCUMENT_STATUS = 'UPDATE_UPLOAD_DOCUMENT_STATUS';
export const UPLOAD_ERROR = 'Error';
export const UPLOAD_IN_PROGRESS = 'Uploading';
export const LOGOUT = 'LOGOUT';
export const SUBMIT_ORDER_PROCESSING = 'SUBMIT_ORDER_PROCESSING';
export const SUBMIT_ORDER_ERROR = 'SUBMIT_ORDER_ERROR';
export const SUBMIT_ORDER_COMPLETE = 'SUBMIT_ORDER_COMPLETE';
export const LOAD_ORDERS = 'LOAD_ORDERS';
export const CHECKOUT_ORDER = 'CHECKOUT_ORDER';
export const LOAD_USER_ACCOUNT = 'LOAD_USER_ACCOUNT';
export const UPDATE_USER_ACCOUNT = 'UPDATE_USER_ACCOUNT';
export const LOAD_JOB = 'LOAD_JOB';

export const LOAD_MY_PRINT_HUB = 'LOAD_MY_PRINT_HUB';
export const LOAD_HUB_ORDERS = 'LOAD_HUB_ORDERS';
export const LOAD_PRINT_HUBS = 'LOAD_PRINT_HUBS';

export const IS_HUB_CONNECTED = 'IS_HUB_CONNECTED';
export const HUB_DISCONNECTED = 'HUB_DISCONNECTED';
export const HUB_CONNECTED = 'HUB_CONNECTED';
export const HUB_RESTART_STARTED = 'HUB_RESTART_STARTED';
export const HUB_RESTART_ERROR = 'HUB_RESTART_ERROR';

export const LOAD_TRANSACTIONS = 'LOAD_TRANSACTIONS';

let hubClient = () => {
    return axios.create({
        baseURL: hubUrl,
        headers: {
            Authorization: localStorage.getItem("id_token")
        }
    });
}

export function retrieveToken(code) {

    if (code) {
        let data = new URLSearchParams();
        data.append("grant_type", "authorization_code")
        data.append("client_id", clientId)
        data.append("code", code)
        data.append("redirect_uri", redirectUrl)

        return {
            type: RETRIEVE_TOKEN,
            payload: axios.post(tokenUrl, data)
        }
    }

    return {
        type: RETRIEVE_TOKEN,
        payload: null
    }
}

export function getDocuments(params) {
    return {
        type: LOAD_DOCUMENTS,
        payload: {
            axiosParam: {
                url: 'documents',
                baseURL: docUrl,
                method: 'get',
                params: params
            }
        }
    }
}

export function deleteDocument(id) {
    return {
        type: DELETE_DOCUMENT,
        payload: {
            axiosParam: {
                url: 'documents/' + id,
                baseURL: docUrl,
                method: 'delete'
            }
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
                    axiosParam: {
                        url: 'documents',
                        baseURL: docUrl,
                        method: 'post',
                        data: body
                    }
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
    localStorage.removeItem("id_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_ts");

    return {
        type: LOGOUT
    };
}

/**
 * It takes in the complete order object and 2nd variable tells if it has be checked out now or later.
 * @param {*} order 
 * @param {*} now 
 */
export const printLater = (order, now) => (dispatch) => {

    dispatch({
        type: SUBMIT_ORDER_PROCESSING,
        payload: order
    });

    hubClient()({
        method: 'post',
        url: 'orders',
        data: order
    }).then((response) => {
        dispatch({
            type: SUBMIT_ORDER_COMPLETE,
            payload: response.data
        });

        if (now) {
            hubClient()({
                method: 'get',
                url: `orders/${response.data.id}/checkout`
            }).then((response) => {
                dispatch({
                    type: CHECKOUT_ORDER,
                    payload: response
                });
            }).catch((error) => {
                console.log(error);
            });
        }

    }).catch((error) => {
        dispatch({
            type: SUBMIT_ORDER_ERROR,
            payload: { order, error }
        });
    });
}

export const printNow = (order) => (dispatch) => {
    console.log("printNow");
    return {
        type: 'printNow'
    };
}

export const orderCheckout = (orderId) => {
    return {
        type: CHECKOUT_ORDER,
        payload: {
            axiosParam: {
                url: `orders/${orderId}/checkout`,
                baseURL: hubUrl,
                method: 'get'
            }
        }
    };
}


export const getOrders = () => {
    return {
        type: LOAD_ORDERS,
        payload: {
            axiosParam: {
                url: 'orders',
                baseURL: hubUrl,
                method: 'get'
            }
        }
    };
};

export const loadJob = (order) => {
    return {
        type: LOAD_JOB,
        payload: {
            axiosParam: {
                baseURL: hubUrl,
                url: 'print-jobs/' + order.jobId[0],
                method: 'get'
            }
        }
    };
};

export const loadUserAccount = () => {
    return {
        type: LOAD_USER_ACCOUNT,
        payload: {
            axiosParam: {
                url: 'user-account',
                baseURL: accountUrl,
                method: 'get'
            }
        }
    };
}

export const updateUserAccount = (account) => {
    return {
        type: UPDATE_USER_ACCOUNT,
        payload: {
            axiosParam: {
                url: 'user-account',
                baseURL: accountUrl,
                method: 'post',
                data: account
            }
        }
    };
}

export const getPrintHub = () => {
    return {
        type: LOAD_MY_PRINT_HUB,
        payload: {
            axiosParam: {
                url: 'print-hub',
                baseURL: hubUrl,
                method: 'get'
            }
        }
    };
}

export const loadPrintHubs = () => {
    return {
        type: LOAD_PRINT_HUBS,
        payload: {
            axiosParam: {
                url: 'print-hubs',
                baseURL: hubUrl,
                method: 'get'
            }
        }
    };
}

export const isConnected = () => (dispatch) => {

    dispatch({
        type: IS_HUB_CONNECTED,
        payload: IS_HUB_CONNECTED
    });

    axios({
        baseURL: hubAdminUrl,
        url: 'heart-beat',
        method: 'get'
    }).then((response) => {

        if (response.data) {
            dispatch({
                type: HUB_CONNECTED,
                payload: HUB_CONNECTED
            });
        } else {
            dispatch({
                type: HUB_DISCONNECTED,
                payload: HUB_DISCONNECTED
            });
        }
    }).catch((error) => {
        dispatch({
            type: HUB_DISCONNECTED,
            payload: HUB_DISCONNECTED
        });
    });

}

export const hubRestart = (credentials) => (dispatch) => {

    dispatch({
        type: HUB_RESTART_STARTED,
        payload: HUB_RESTART_STARTED
    });

    let axiosParam = {
        baseURL: hubAdminUrl,
        url: 'restart',
        method: 'get'
    };

    if(credentials.id_token){
        axiosParam = {
            baseURL: hubAdminUrl,
            url: 'register',
            method: 'post',
            data: credentials
        }
    }

    axios(axiosParam).then((response) => {

        if (response.data) {
            dispatch({
                type: HUB_CONNECTED,
                payload: HUB_CONNECTED
            });
        } else {
            dispatch({
                type: HUB_RESTART_ERROR,
                payload: HUB_RESTART_ERROR
            });
        }
    }).catch((error) => {
        dispatch({
            type: HUB_RESTART_ERROR,
            payload: HUB_RESTART_ERROR
        });
    });
    
}

export const loadTransactions = (params) => {
    return {
        type: LOAD_TRANSACTIONS,
        payload: {
            axiosParam: {
                url: 'transactions',
                baseURL: hubUrl,
                method: 'get',
                params: params
            }
        }
    }
}