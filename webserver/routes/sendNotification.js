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
    webPush.sendNotification(req.body, {
        TTL: 4000,
        payload: JSON.stringify({
            'title': req.body.title,
            'icon': req.body.icon,
            'body': req.body.body,
            url: req.body.link
        }),
        userPublicKey: req.body.key,
        userAuth: req.body.authSecret,
        headers: {
            'Authorization':'GCM_API_KEY'
        }
    })

        .then(function() {
            res.sendStatus(201);
        }, function(err) {
            console.log('Error In Send');
            console.log(err);
        });
});

module.exports = router;

