import _ from 'lodash'

import { LOAD_TRANSACTIONS } from '../actions'

export default function (state = {}, action) {
    switch(action.type){
        case LOAD_TRANSACTIONS:
            let newTransactions = action.payload.data;

            if(state.Items){
                newTransactions.Items = _.concat(state.Items, newTransactions.Items);
                return newTransactions;
            }
            else
                return newTransactions;
            break;
    }
    return state;
}  