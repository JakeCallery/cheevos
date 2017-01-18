/**
 * Created by Jake on 12/30/2016.
 */

const express = require('express');
const router = express.Router();
const webPush = require('web-push');

const User = require('../models/User');
const authConfig = require('../keys/authConfig');
const BadgeManager = require('../managers/BadgeManager');
const Badge = require('../models/Badge');

webPush.setGCMAPIKey(authConfig.gcmAuth.apiKey);

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
    BadgeManager.saveBadgeToDB(user.id, req.body.memberId, req.body.teamName, req.body.teamId, badge)
    .then(($isBlocked) => {
        console.log('IsBlocked: ' + $isBlocked);
        if(!$isBlocked){
            return User.findEndPointsByUserId(req.body.memberId)
        } else {
            return new Promise((resolve, reject) => {
                //user is blocked, stop here.
                resolve(null);
            });
        }
    })
    .then(($dbResult) => {
        if($dbResult !== null) {
            console.log('Have Endpoints: ', $dbResult.records.length);
            const options = {
                vapidDetails: {
                    subject: 'http://subvoicestudios.com',
                    publicKey: authConfig.pushAuth.publicKey,
                    privateKey: authConfig.pushAuth.privateKey
                },
                // 24 hours in seconds.
                TTL: 24 * 60 * 60
            };

            //TODO: Green thread this maybe? / Hand off to another process?
            //Hand off to queue process of some kind?
            //Might be a good place to play with "yield", or "async"
            for (let i = 0; i < $dbResult.records.length; i++) {
                let sub = $dbResult.records[i].get('subscription');
                let subscription = {
                    endpoint: sub.properties.endpoint,
                    keys: {
                        p256dh: sub.properties.p256dh,
                        auth: sub.properties.auth
                    }
                };

                //TODO: Flatten these promises
                webPush.sendNotification(
                    subscription,
                    JSON.stringify(
                        {
                            iconUrl: req.body.iconUrl,
                            nameText: req.body.nameText,
                            descText: req.body.descText
                        }
                    ),
                    options
                )
                    .then((result) => {
                        console.log('Push Return Code: ', result.statusCode);
                        console.log('Push Return Body: ', result.body);
                    })
                    .catch((error) => {
                        console.log('Push Error: ', error.message);
                    });
            }

            //TODO: Decide if we need to wait for all endpoint sends or just return "ok"
            //after the first

            //Return Success (always for now)
            let resObj = {
                status: 'SUCCESS'
            };
            res.status(200).json(resObj);
        } else {
            //Skipping notification because user is blocked,
            //just return success to caller
            console.log('User is blocked, not sending notification...');
            let resObj = {
                status: 'SUCCESS'
            };
            res.status(200).json(resObj);
        }
    })
    .catch(($error) => {
        console.error('Bad Send: ', $error);
        let resObj = {
            error: $error,
            status:'ERROR'
        };
        res.status(400).json(resObj);
    });
});

module.exports = router;