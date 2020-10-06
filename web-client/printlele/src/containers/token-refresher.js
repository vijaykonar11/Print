import axios from 'axios'
import { clientId, refreshInterval, tokenUrl } from '../config'

export default function startTokenRefresher() {
    console.log("startTokenRefresher called")

    var parseJwt = function(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    };

    var fn = function () {

        console.log("Starting token check")

        let id_token = localStorage.getItem("id_token");
        let refresh_token = localStorage.getItem("refresh_token");

        if(!id_token)
            return;

        let current_time = Date.now() / 1000;
        let parsed_id_token = parseJwt(id_token);
        let diff = current_time - parsed_id_token.exp;

        console.log(`current_time ${current_time} exp_time ${parsed_id_token.exp} diff: ${diff / 60}mins`);

        if(diff > 0){
            if (!refresh_token)
                return;

            let data = new URLSearchParams();
            data.append("grant_type", "refresh_token")
            data.append("client_id", clientId)
            data.append("refresh_token", refresh_token)

            axios.post(tokenUrl, data).then(response => {
                let tokens = response.data;
                localStorage.setItem("id_token", tokens.id_token);
                localStorage.setItem("access_token", tokens.access_token);
                localStorage.setItem("token_ts", new Date().getTime());
                console.log("Tokens refreshed at " + new Date().getTime());
            }).catch(error => console.error(error));
        }
    };

    setInterval(fn, 60 * 1000);
    fn();

}