import { LOAD_PRINT_HUBS } from '../actions'

export default function (state = null, action) {
    switch(action.type){
        case LOAD_PRINT_HUBS:
            return action.payload.data;
    }
    return state;
}  