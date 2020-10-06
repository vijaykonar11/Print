import { SUBMIT_ORDER_PROCESSING, SUBMIT_ORDER_ERROR, SUBMIT_ORDER_COMPLETE } from '../actions'

export default function (state = {}, action) {

    switch(action.type){
        case SUBMIT_ORDER_PROCESSING:
            return {
                status: 'Submitting order..',
                order: action.payload
            };

        case SUBMIT_ORDER_COMPLETE:
            return {
                status: 'Order submitted.',
                order: action.payload
            }
        case SUBMIT_ORDER_ERROR:
            return {
                status: 'Error submitting order!',
                order: action.payload.order,
                error: action.payload.error
            }
    }
    
    return state;
}  