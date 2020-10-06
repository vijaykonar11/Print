import { LOAD_HUB_ORDERS } from '../actions'

export default function (state = null, action) {

    switch (action.type) {
        case LOAD_HUB_ORDERS:
            return action.payload.data.Items;
    }

    return state;
}