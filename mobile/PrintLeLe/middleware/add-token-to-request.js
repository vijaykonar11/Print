
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function doAddRequest(payload) {
    return payload && typeof payload.fn === 'function';
}

const AddTokenToRequest = store => next => action => {
    if(doAddRequest(action.payload)){
        let dispatch = store.dispatch;
        let payload = action.payload;

        let params = _extends({}, payload.params, {
            headers: {
                Authorization: store.getState().Tokens.id_token
            } 
        });

        return dispatch(_extends({}, action, {
            payload: payload.fn(payload.url, params)
        }));
    } else {
        next(action);
    }
}

export default AddTokenToRequest