import { Handler, Context, Callback } from 'aws-lambda';

import { paytm_config } from './paytm/paytm_config';
import { genchecksum, verifychecksum } from './paytm/checksum';
//var querystring = require('querystring');

import { APIResponse } from './models'

const paytmChecksum: Handler = (event: any, context: Context, callback: Callback) => {

	if (!event.requestContext.authorizer)
		return context.fail("Unauthorized access");

	let ownerId = event.requestContext.authorizer.claims['cognito:username'];

	console.log('event.requestContext')
	console.log(event.requestContext)

	let action = event.pathParameters.action;
	let request = JSON.parse(event.body);

	switch (action) {
		case 'generate_checksum':
			var paramarray: any = {};
			paramarray['MID'] = paytm_config.MID; //Provided by Paytm
			paramarray['ORDER_ID'] = request.orderId; //unique OrderId for every request
			paramarray['CUST_ID'] = ownerId;  // unique customer identifier 
			paramarray['INDUSTRY_TYPE_ID'] = paytm_config.INDUSTRY_TYPE_ID; //Provided by Paytm
			paramarray['CHANNEL_ID'] = paytm_config.CHANNEL_ID; //Provided by Paytm
			paramarray['TXN_AMOUNT'] = request.amount; // transaction amount
			paramarray['WEBSITE'] = paytm_config.WEBSITE; //Provided by Paytm
			paramarray['CALLBACK_URL'] = 'https://pguat.paytm.com/paytmchecksum/paytmCallback.jsp';//Provided by Paytm
			paramarray['EMAIL'] = request.email; // customer email id
			paramarray['MOBILE_NO'] = request.mobile; // customer 10 digit mobile no.

			console.log("paramarray object");
			console.log(paramarray);
			console.log("paytm_config.MERCHANT_KEY : " + paytm_config.MERCHANT_KEY);

			genchecksum(paramarray, paytm_config.MERCHANT_KEY, function (error: any, response: any) {
				if (error) {
					console.log(error);
					return context.fail("Unable to get data. error: " + error.message);
				}

				let result = new APIResponse(200, response);
				console.log(result);
				callback(undefined, result);
			});
			break;
		case 'verify_checksum':
			let response = {
				verify: verifychecksum(request, paytm_config.MERCHANT_KEY)
			}

			let result = new APIResponse(200, response);
			console.log(result);
			callback(undefined, result);

			break;
	}
}

function htmlEscape(str: string) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

export { paytmChecksum }