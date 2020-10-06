import axios from 'axios'
import { clientId, refreshInterval, tokenUrl } from '../config'

export default function startTokenRefresher() {
    console.log("startTokenRefresher called")

    var fn = function () {

        console.log("Starting token check")

        let id_token = '';
        let refresh_token = '';
        let token_ts = '';

        (async () => {
            id_token = await AsyncStorage.getItem("id_token");
            refresh_token = await AsyncStorage.getItem("refresh_token");
            token_ts = await AsyncStorage.getItem("token_ts");
        })();

        if (!refresh_token)
            return;

        if (token_ts)
            token_ts = parseInt(token_ts)
        else
            token_ts = 0

        let diff = (new Date().getTime() - token_ts);

        console.log(`token_ts ${token_ts} diff ${diff / (60 * 1000)}`)

        if (diff > refreshInterval) {
            let data = new URLSearchParams();
            data.append("grant_type", "refresh_token")
            data.append("client_id", clientId)
            data.append("refresh_token", refresh_token)

            axios.post(tokenUrl, data).then(response => {
                try {
                    let tokens = response.data;
                    AsyncStorage.setItem("id_token", tokens.id_token);
                    AsyncStorage.setItem("refresh_token", tokens.refresh_token);
                    AsyncStorage.setItem("token_ts", new Date().getTime());
                    console.log("Tokens refreshed at " + new Date().getTime());
                } catch (error) {
                    console.log(error)
                }
            }).catch(error => console.error(error));
        }

    };

    setInterval(fn, 60 * 1000);
    fn();

}