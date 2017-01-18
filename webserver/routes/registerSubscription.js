/**
 * Created by Jake on 12/30/2016.
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', (req, res) => {
    console.log('Caught Register Subscription request: ', req.body);

    let user = req.cheevosData.sessionUser;
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
});

module.exports = router;