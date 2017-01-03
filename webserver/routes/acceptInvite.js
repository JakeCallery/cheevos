/**
 * Created by Jake on 1/1/2017.
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const InviteManager = require('../managers/InviteManager');

router.post('/', (req, res) => {
     console.log('Caught request to accept an invite');

     if(typeof (req.user) !== 'undefined'){
        let user = new User();
        user.updateFromUserRecord(req.user.data);

        console.log('Invite Code: ', req.body.inviteCode);
        user.acceptInvite(req.body.inviteCode)
        .then(($dbResult) => {
            console.log('Caught Accept Invite results: ', $dbResult);
            let resObj = {
                status:'SUCCESS'
            };

            res.status(200).json(resObj);

        })
        .catch(($error) => {
            console.log('Accept Invite Top Level Error: ', $error);
            let resObj = {
                error:'ACCEPT_INVITE_ERROR',
                status:'ERROR',
                message:$error
            };
            res.status(404).json(resObj);
        });


     } else {
         //not logged in
         console.log('Not logged in, can\'t store endpoint...');
         let resObj = {
             error:'NOT_LOGGED_IN',
             status:'ERROR'
         };
         res.status(401).json(resObj);
     }

});

module.exports = router;