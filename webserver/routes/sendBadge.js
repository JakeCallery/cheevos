/**
 * Created by Jake on 12/30/2016.
 */

const express = require('express');
const router = express.Router();

const promiseRetry = require('promise-retry');

const User = require('../models/User');
const BadgeManager = require('../managers/BadgeManager');
const Badge = require('../models/Badge');
const EmailManager = require('../managers/EmailManager');

router.post('/', (req, res) => {
    let user = req.cheevosData.sessionUser;
    console.log('Store badge for user');
    let badge = new Badge(
        req.body.memberId,
        req.body.nameText,
        req.body.descText,
        req.body.iconUrl
    );

    //TODO: Check for Team and User existence first
    //needs better error handling if those don't exist
    //TODO: make sure that the send notification stuff doesn't run
    //if db save fails
    promiseRetry((retry, attempt) => {
        console.log('saveBadgeToDB attempt: ' + attempt);
        return BadgeManager.saveBadgeToDB(user.id, req.body.memberId, req.body.teamId, badge)
        .then(($badgeDBResult) => {
            let senderUser = User.newUserFromDBRecord($badgeDBResult.records[0].get('sender'));
            let recipientUser = User.newUserFromDBRecord($badgeDBResult.records[0].get('recipient'));
            return BadgeManager.sendBadgeNotifications(
                senderUser.id,
                senderUser.fullName,
                recipientUser.id,
                recipientUser.fullName,
                req.body.teamId,
                Badge.newBadgeFromDB($badgeDBResult.records[0].get('badge')));
        })
        .then(($pushResult) => {
            console.log('Message Pushed: ', $pushResult);
            let resObj = {
                status: 'SUCCESS'
            };
            res.status(200).json(resObj);
        })
        .catch(($error) => {
            if ($error.hasOwnProperty('fields') && $error.fields[0].code == 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                console.log('duplicate badge id, retrying: ' + attempt);
                retry('create badge duplicate id');
            } else {
                console.error('Bad Send: ', $error);
                let resObj = {
                    error: $error,
                    status: 'ERROR'
                };
                res.status(400).json(resObj);
            }
        });
    }, {retries:3})
    .catch(($error) => {
        console.error('saveBadgeToDB Failed: ', $error);
        let resObj = {
            error: $error,
            status: 'ERROR'
        };
        res.status(400).json(resObj);
    });

});

module.exports = router;