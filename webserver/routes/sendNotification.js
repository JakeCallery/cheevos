/**
 * Created by Jake on 12/18/2016.
 */
'use strict';

const express = require('express');
const router = express.Router();
const webPush = require('web-push');
const authConfig = require('../keys/authConfig');

webPush.setGCMAPIKey(authConfig.gcmAuth.apiKey);

router.post('/', function(req, res) {
    console.log('Endpoint:');
    console.log(req.body.endpoint);
    // let payload = JSON.stringify({
    //         'title': req.body.title,
    //         'icon': req.body.icon,
    //         'body': req.body.body,
    //         url: req.body.link
    // });

    const options = {
        vapidDetails: {
            subject: 'Cheevos Push',
            publicKey: authConfig.pushAuth.publicKey,
            privateKey: authConfig.pushAuth.privateKey
        },
        // 1 hour in seconds.
        TTL: 60 * 60
    };

    webPush.sendNotification(
        req.body.subscription,
        req.body.data,
        options
    )
    .then(() => {
        console.log('Good Push Send');
        res.sendStatus(201);
    })
    .catch((err) => {
        console.log('Error In Send');
        console.log(err);
        if (err.statusCode) {
            res.status(err.statusCode).send(err.body);
        } else {
            res.status(400).send(err.message);
        }
    });
});

module.exports = router;

