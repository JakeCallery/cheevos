/**
 * Created by Jake on 12/18/2016.
 */
'use strict';

let express = require('express');
let router = express.Router();
let webPush = require('web-push');
webPush.setGCMAPIKey(process.env.GCM_API_KEY);

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
            subject: 'https://developers.google.com/web/fundamentals/',
            publicKey: req.body.applicationKeys.public,
            privateKey: req.body.applicationKeys.private
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

