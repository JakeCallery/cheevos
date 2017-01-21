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

let oauth2Client = null;
let gmailClient = null;

function getOAuth2Client($credentials) {
    let clientSecret = $credentials.installed.client_secret;
    let clientId = $credentials.installed.client_id;
    let redirectUrl = $credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            console.error('Bad GMail Token, run webServerTools to generate a new one!');
            return null;
        } else {
            oauth2Client.credentials = JSON.parse(token);
            return oauth2Client;
        }
    });
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
    oauth2Client = getOAuth2Client(JSON.parse(content));

    if(oauth2Client !== null) {
        //create gmail client
        gmailClient = google.gmail('v1');
        console.log('***** Gmail Client Created *****');
    } else {
        console.error('bad oauth2client');
    }
}

module.exports = {
    client:gmailClient,
    auth:oauth2Client
};

