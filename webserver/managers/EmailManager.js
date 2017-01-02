/**
 * Created by Jake on 1/1/2017.
 */

const db = require('../config/db');

class EmailManager {
    constructor(){
        //Nothing to construct
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