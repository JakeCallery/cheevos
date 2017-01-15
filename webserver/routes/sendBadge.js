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
    if(typeof(req.user) !== 'undefined'){
        let user = User.newUserFromDBRecord(req.user.data);
        //let user = new User();
        //user.updateFromUserRecord(req.user.data);

        console.log('Store badge for user');
        let badge = new Badge(
            req.body.nameText,
            req.body.descText,
            req.body.iconUrl
        );

        BadgeManager.saveBadgeToDB(user.id, req.body.memberId, req.body.teamName, req.body.teamId, badge)
        .then(($dbResult) => {
            return User.findEndPointsByUserId(req.body.memberId)
        })
        .then((result) => {
            console.log('Have Endpoints: ', result.records.length);
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
            for (let i = 0; i < result.records.length; i++) {
                let sub = result.records[i].get('subscription');
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
                    console.log('Push Error: ',error.message);
                });

            }


            //TODO: Decide if we need to wait for all endpoint sends or just return "ok"
            //after the first

            //Return Success (always for now)
            let resObj = {
                status:'SUCCESS'
            };
            res.status(200).json(resObj);

        })
        .catch(($error) => {
            console.error('Bad Send: ', $error);
            let resObj = {
                error: $error,
                status:'ERROR'
            };
            res.status(400).json(resObj);
        });
    } else {
        console.log('Not logged in, can\'t send badge...');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        res.status(401).json(resObj);
    }
});

module.exports = router;