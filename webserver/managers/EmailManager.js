/**
 * Created by Jake on 1/1/2017.
 */

const db = require('../config/db');
const gmail = require('../config/gmail');
const client = gmail.getClient();
const auth = gmail.getAuth();

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
        emailLines.push('Sent At: ' + new Date());

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

    //TODO: Split out actual email send
    //TODO: Send invitor name in email
    static sendInviteEmail($inviteRecord, $invitorId, $teamName){
        return new Promise((resolve, reject) => {
            console.log('Emailing: ' + $inviteRecord.properties.email);
            let emailLines = [];
            emailLines.push('From: "Cheevos" <jcallery@subvoicestudios.com>');
            emailLines.push('To: ' + $inviteRecord.properties.email);
            emailLines.push('Content-type: text/html;charset=iso-8859-1');
            emailLines.push('MIME-Version: 1.0');
            emailLines.push('Subject: You have been invited to a Cheevos Team!');
            emailLines.push('');
            emailLines.push('Please click the link below to join the ' + $teamName + ' team.');
            emailLines.push(
                'Link: <a href="http://subvoicestudios.com/invited/' + $inviteRecord.properties.code + '">' +
                'Accept Invite</a>');

            let email = emailLines.join('\r\n').trim();

            let base64EncodedEmail = new Buffer(email).toString('base64');
            base64EncodedEmail = base64EncodedEmail.replace(/\+/g, '-').replace(/\//g, '_');

            let cb = function($error, $response){
                console.log('-- CB CALLED --');
                if($error){
                    reject($error);
                } else {
                    resolve($response);
                }
            };

            client.users.messages.send({
                auth: auth,
                userId: 'me',
                resource: {
                    raw: base64EncodedEmail
                }
            },cb);
        })
    }
}

module.exports = EmailManager;