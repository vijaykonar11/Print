import { LOAD_ORDERS, CHECKOUT_ORDER, SUBMIT_ORDER_COMPLETE, LOAD_JOB } from '../actions'

export default function (state = null, action) {

    switch (action.type) {
        case LOAD_ORDERS:
            return action.payload.data.Items;
        case CHECKOUT_ORDER:
            console.log(action.payload);
            if (action.payload.data) {
                let updatedOrder = action.payload.data.order;
                let updatedJob = action.payload.data.printJob;
                state = state.map((order) => {
                    if (order.id == updatedOrder.id){
                        updatedOrder.job = updatedJob;
                        return updatedOrder;
                    }
                    else
                        return order;
                });
            } else {
                alert(action.payload.response.data.errorMessage);
            }
            break;
        case SUBMIT_ORDER_COMPLETE:
            if (!state)
                state = [];
            state = state.slice()
            state.push(action.payload);
            break;
        case LOAD_JOB:
            let job;
            if (action.payload.data) {
                job = action.payload.data.Items[0];
            } else {
                job = { 
                    id: action.payload,
                    error: 'ERROR'
                };
            }

            if (!state)
                state = [];
            state = state.slice();

            state = state.map((order) => {
                if (order.jobId[0] == job.id)
                    order.job = job;
                return order;
            });            
            break;
    }

    return state;
}