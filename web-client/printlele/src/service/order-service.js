import axios from 'axios'

import { hubUrl } from '../config'

export const checkoutOrder = (orderId, idToken) => {
    return axios({
        baseURL: hubUrl,
        url: `orders/${orderId}/checkout`,
        method: 'get',
        headers: {
            Authorization: this.props.tokens.idToken
        }
    });
}