/**
 * Created by Jake on 1/21/2017.
 */
const fs = require('fs');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send'
];

const TOKEN_DIR = './keys/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'cheevos-gmail.json';

let authClient = null;
let gmailClient = null;

function getOAuth2Client($credentials) {
    let clientSecret = $credentials.installed.client_secret;
    let clientId = $credentials.installed.client_id;
    let redirectUrl = $credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    let tokenContents = null;

    // Check if we have previously stored a token.
    try {
        tokenContents = fs.readFileSync(TOKEN_PATH);

    } catch ($error) {
        console.error('Token read error: ', $error);
        return null;
    }

    if(tokenContents !== null) {
        console.log('Good gmail token...');
        oauth2Client.credentials = JSON.parse(tokenContents);
        return oauth2Client;
    }
}

console.log('***** Authorizing Gmail *****');
// Load client secrets from a local file.
let content = null;
try {
    content = fs.readFileSync('./keys/CheevosGmailSecret.json');
}
catch ($error) {
    console.error('Error loading client secret file: ' + $error);
    console.log('**** Gmail NOT authorized ****');
    return;
}

if(content !== null) {
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    //authorize(JSON.parse(content), listLabels);
    authClient = getOAuth2Client(JSON.parse(content));

    if(authClient !== null && typeof(authClient) !== 'undefined') {
        //create gmail client
        gmailClient = google.gmail('v1');
        console.log('***** Gmail Client Created *****');
    } else {
        console.error('bad oauth2client');
    }
}

function getClient() {
    return gmailClient
}

module.exports = {
    getClient: function(){
        return gmailClient;
    },
    getAuth: function(){
        return authClient;
    }
};

