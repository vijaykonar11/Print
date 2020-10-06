let baseAuthUrl = "https://printnets.auth.us-east-1.amazoncognito.com";

let clientId = "69qhru72bmtt8l19psr0h23nkc";
let redirectUrl = "https://printlele.com/home";

// let clientId = "5ns8j813614eiddpvk00mktiv";
// let redirectUrl = "http://localhost:8080/home";

let loginPage = `${baseAuthUrl}/login?redirect_uri=${redirectUrl}&response_type=code&client_id=${clientId}`
let refreshInterval = 30 * 60 * 1000;

let tokenUrl = baseAuthUrl + "/oauth2/token";
let docUrl = 'https://81988ogehf.execute-api.us-east-1.amazonaws.com/dev/';
let hubUrl = 'https://l6sotpv3z1.execute-api.us-east-1.amazonaws.com/dev/'; 
let accountUrl = 'https://ymmfci9gyf.execute-api.us-east-1.amazonaws.com/dev/'; 
let hubAdminUrl = 'http://localhost:5678/'; 
let logUrl = docUrl;

export { baseAuthUrl, clientId, redirectUrl, loginPage, 
    refreshInterval, tokenUrl, hubUrl, docUrl, accountUrl, hubAdminUrl, logUrl }
