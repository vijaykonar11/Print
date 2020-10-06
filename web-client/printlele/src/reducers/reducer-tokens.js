import { RETRIEVE_TOKEN, LOGOUT } from '../actions'

let EXPIRED_TOKEN_MESSAGE = "The incoming token has expired";

export default function (state = null, action) {

    let id_token = localStorage.getItem("id_token");
    let refresh_token = localStorage.getItem("refresh_token");
    let access_token = localStorage.getItem("access_token");

    if(action && action.payload && action.payload.data && action.payload.data.message == EXPIRED_TOKEN_MESSAGE){
        id_token = "EXPIRED";
    }
    
    switch(action.type){
        case RETRIEVE_TOKEN:
            if(action.payload.response && action.payload.response.status != 200){
                window.location = '/home';
                return {};
            }

            let tokens = action.payload.data;
            localStorage.setItem("id_token", tokens.id_token);
            localStorage.setItem("refresh_token", tokens.refresh_token);
            localStorage.setItem("access_token", tokens.access_token);
            localStorage.setItem("token_ts", new Date().getTime());
            return tokens;
        case LOGOUT:
            return {};
    }

    return { id_token, refresh_token, access_token }
}  