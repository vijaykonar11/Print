import { IS_HUB_CONNECTED, HUB_CONNECTED, HUB_DISCONNECTED, HUB_RESTART_ERROR, HUB_RESTART_STARTED } from '../actions'

export default function (state = {}, action) {

    switch(action.type){
        case HUB_CONNECTED:
        case IS_HUB_CONNECTED:
            if(state.status == HUB_RESTART_STARTED || state.status == HUB_RESTART_ERROR)
                return state;
        case HUB_DISCONNECTED:
        case HUB_RESTART_ERROR:
        case HUB_RESTART_STARTED:
            let hubAdmin = Object.assign({}, state);
            hubAdmin.status = action.type
            state = hubAdmin;
            break;
    }

    return state;
}  