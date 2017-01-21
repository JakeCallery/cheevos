/**
 * Created by Jake on 1/1/2017.
 */

const db = require('../config/db');
const gmail = require('../config/gmail');

class EmailManager {
    constructor(){
        //Nothing to construct
        //TODO: Make this a singleton?
    }

    static sendTestEmail($emailAddress){
        console.log('Sending Test Email...');

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