let request = require('request')

let oauthToken: string | undefined = undefined;
let tokenTime: number = -1;
let expirySec: number = -1;

const getOAuthToken = () => {

    let currentSec = Date.now() / 1000;

    console.log(`getOAuthToken oauthToken ${oauthToken} currentSec ${currentSec} tokenTime ${tokenTime} expirySec ${expirySec}`);

    return new Promise((resolve, reject) => {
        if (!oauthToken || (tokenTime + expirySec < currentSec)) {

            console.log('Fetching new access token');
            let tokenUrl = process.env.googleOAuthTokenUrl;
            request({
                method: 'POST',
                url: tokenUrl,
                form: {
                    refresh_token: process.env.googleOAuthRefreshToken,
                    client_id: process.env.googleOAuthClientId,
                    client_secret: process.env.googleOAuthClientSecret,
                    grant_type: 'refresh_token'
                }
            }, (error, response, body) => {
                if (error) {
                    console.log('Error retrieving new token')
                    console.log(error)
                    reject('Error retrieving new token ' + JSON.stringify(error));
                }

                console.log('new token body');
                console.log(body);
                body = JSON.parse(body);

                oauthToken = body.access_token;
                expirySec = body.expires_in;
                tokenTime = currentSec;

                console.log('New token retrieved at ' + tokenTime);
                resolve(oauthToken);
            });

        } else {
            resolve(oauthToken)
        }
    });
    
}

const getPrinterStatus = async (id: string): Promise => {

    let oauthToken = await getOAuthToken();

    return new Promise((resolve, reject) => {

        let printerLookUpUrl = process.env.printerLookUpUrl as string;

        let formData = {
            printerid: id,
            extra_fields: 'connectionStatus,uiState,queuedJobsCount',
            use_cdd: 'true'
        };

        request({
            method: 'POST',
            url: printerLookUpUrl,
            formData: formData,
            headers: {
                Authorization: 'OAuth ' + oauthToken
            }
        }, (error, response, body) => {
            if (error)
                reject(error);
            else{
                body = JSON.parse(body);
                if(body.printers.length > 0)
                    resolve({
                        uiState: body.printers[0].uiState,
                        connectionStatus: body.printers[0].connectionStatus,
                        jobsCount: body.printers[0].queuedJobsCount
                    });
                else reject();
            }
        });
    });

}

export { getPrinterStatus }