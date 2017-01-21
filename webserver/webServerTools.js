/**
 * Created by Jake on 1/21/2017.
 */

const opt = require('node-getopt');
const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

/////// CONFIG ////////
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
];

// const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
//                     process.env.USERPROFILE) + '/.credentials/';

const TOKEN_DIR = './keys/.credentials/';

const TOKEN_PATH = TOKEN_DIR + 'cheevos-gmail.json';

//FUNCTIONS////////////
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    let clientSecret = credentials.installed.client_secret;
    let clientId = credentials.installed.client_id;
    let redirectUrl = credentials.installed.redirect_uris[0];
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    let authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    let gmail = google.gmail('v1');
    gmail.users.labels.list({
        auth: auth,
        userId: 'me',
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        let labels = response.labels;
        if (labels.length == 0) {
            console.log('No labels found.');
        } else {
            console.log('Labels:');
            for (let i = 0; i < labels.length; i++) {
                let label = labels[i];
                console.log('- %s', label.name);
            }
        }
    });
}

function sendTestEmail($auth, $callback) {
    console.log('Sending Test Email');
    let gmail = google.gmail('v1');
    let emailLines = [];

    emailLines.push('From: "Cheevos" <jcallery@subvoicestudios.com>');
    emailLines.push('To: jake.a.callery@gmail.com');
    emailLines.push('Content-type: text/html;charset=iso-8859-1');
    emailLines.push('MIME-Version: 1.0');
    emailLines.push('Subject: Sweet Cheevos Test Email');
    emailLines.push('');
    emailLines.push('Sweet Cheevos test body text, and <b> BOLD! </b>');

    let email = emailLines.join('\r\n').trim();

    let base64EncodedEmail = new Buffer(email).toString('base64');
    base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');

    gmail.users.messages.send({
        auth: $auth,
        userId: 'me',
        resource: {
            raw: base64EncodedEmail
        }
    },$callback);

}

////////////// Setup args /////////////
let args = opt.create([
    ['', 'auth-gmail'                             , 'run gmail auth'],
    ['h', 'help'                            , 'display this help'],
    ['v', 'version'                         , 'show version']
])
    .bindHelp()
    .parseSystem();

console.log(args.options);

//////// MAIN ///////////
if(args.options['auth-gmail']){
    console.log('Auth Gmail...');

    // Load client secrets from a local file.
    fs.readFile('./keys/CheevosGmailSecret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Gmail API.
        //authorize(JSON.parse(content), listLabels);
        authorize(JSON.parse(content), sendTestEmail);
    });

}