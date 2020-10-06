import { LOAD_USER_ACCOUNT, UPDATE_USER_ACCOUNT } from '../actions'

export default function (state = null, action) {
    switch(action.type){
        case LOAD_USER_ACCOUNT:
            return action.payload.data.Item ? action.payload.data.Item : {};
        case UPDATE_USER_ACCOUNT:
            if(action.payload.data.updatedData)
                return action.payload.data.updatedData.Attributes;
    }
    return state;
}  