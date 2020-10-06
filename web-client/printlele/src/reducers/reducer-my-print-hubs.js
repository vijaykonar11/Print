import { LOAD_MY_PRINT_HUB } from '../actions'

export default function (state = null, action) {
    switch(action.type){
        case LOAD_MY_PRINT_HUB:
            return action.payload.data.Items;
    }
    return state;
}  