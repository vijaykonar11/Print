import { RETRIEVE_TOKEN, LOGOUT } from '../actions'
import { AsyncStorage } from 'react-native'

let EXPIRED_TOKEN_MESSAGE = "The incoming token has expired";

export default function (state = null, action) {

    let id_token = '';
    let refresh_token = '';
    let access_token = '';

    (async () => {
        id_token = await AsyncStorage.getItem("id_token");
        refresh_token = await AsyncStorage.getItem("refresh_token");
        access_token = await AsyncStorage.getItem("access_token");
    })();

    if (action && action.payload && action.payload.data && action.payload.data.message == EXPIRED_TOKEN_MESSAGE) {
        id_token = "EXPIRED";
    }

    switch (action.type) {
        case RETRIEVE_TOKEN:
            if (action.payload.response && action.payload.response.status != 200) {
                console.error(action.payload);
                return {};
            }

            try {
                let tokens = action.payload.data;
                AsyncStorage.setItem("id_token", tokens.id_token);
                AsyncStorage.setItem("refresh_token", tokens.refresh_token);
                AsyncStorage.setItem("access_token", tokens.access_token);
                AsyncStorage.setItem("token_ts", new Date().getTime());
            } catch (error) {
                console.log(error)
                return {};
            }

            return tokens;
        case LOGOUT:
            return {};
    }

    return { id_token, refresh_token, access_token }
}  