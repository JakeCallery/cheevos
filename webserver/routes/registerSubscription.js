/**
 * Created by Jake on 12/30/2016.
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', (req, res) => {
    console.log('Caught Register Subscription request: ', req.body);

    if(typeof (req.user) !== 'undefined'){
        console.log('Logged in, storing endpoint');

        let user = new User();
        user.updateFromUserRecord(req.user.data);
        user.registerSubscription(req.body)
        .then((result) => {
            //Notify client, its all good
            console.log('notify of registration success');
            let resObj = {
                status:'SUCCESS'
            };
            res.status(200).json(resObj);
        })
        .catch((error) => {
            console.log('registration error: ', error);
            let resObj = {
                error:'SUBSCRIPTION_REGISTRATION_ERROR',
                message:error,
                status:'ERROR'
            };
            res.status(401).json(resObj);
        });


    } else {
        console.log('Not logged in, can\'t store endpoint...');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        res.status(401).json(resObj);
    }

});

module.exports = router;