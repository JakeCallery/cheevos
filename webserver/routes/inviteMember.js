/**
 * Created by Jake on 1/1/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const EmailManager = require('../managers/EmailManager');

router.post('/', (req, res) => {
    console.log('Caught Invite Member Request: ', req.body);

    let user = req.cheevosData.sessionUser;

    //TODO: Sanitize req.body?
    Team.inviteMember(user.id, req.body.email, req.body.teamName, req.body.teamId)
    .then(($dbResult) => {

        console.log('Invite Result: ', $dbResult);

        if($dbResult.records.length === 1) {
            let inviteRecord = $dbResult.records[0].get('invite');

            return new Promise((resolve, reject) => {
                resolve(inviteRecord);
            });
        } else if($dbResult.records.length > 1) {
            return new Promise((resolve, reject) => {
                reject('Multiple invites matched, something went wrong');
            });
        } else {
            return new Promise((resolve, reject) => {
                reject('Could not find user or team to invite to');
            });
        }
    })
    .then(($inviteRecord) => {
        return EmailManager.sendInviteEmail($inviteRecord, user.id);
    })
    .then(($emailResult) => {
        //TODO: For now just assuming that all went well
        //handle email failure here
        let resObj = {
            data:{
                inviteCode: $emailResult.inviteCode
            },
            status:'SUCCESS'
        };
        res.status(200).json(resObj);
    })
    .catch(($error) => {
        console.log('Invite Member Error: ', $error);
        let resObj = {
            error:$error.error,
            status:'ERROR'
        };
        res.status(400).json(resObj);
    });
});

module.exports = router;