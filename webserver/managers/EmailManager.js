/**
 * Created by Jake on 1/1/2017.
 */

const db = require('../config/db');
const gmail = require('../config/gmail');
const client = gmail.client;
const auth = gmail.auth;

class EmailManager {
    constructor(){
        //Nothing to construct
        //TODO: Make this a singleton?
    }

    static sendTestEmail($emailAddress, $callback){
        console.log('Sending Test Email');
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

        client.users.messages.send({
            auth: auth,
            userId: 'me',
            resource: {
                raw: base64EncodedEmail
            }
        },$callback);

    }

    static sendInviteEmail($inviteRecord, $invitorId){
        //TODO: Implement email sending
        return new Promise((resolve, reject) => {
            console.log('Would send email to: ' + $inviteRecord.properties.email);
            resolve({
                inviteCode:$inviteRecord.properties.code
            });
        })
    }
}

module.exports = EmailManager;