/**
 * Created by Jake on 1/1/2017.
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', (req, res) => {
     console.log('Caught request to accept an invite');

     if(typeof (req.user) !== 'undefined'){
        let user = new User();
        user.updateFromUserRecord(req.user.data);

        console.log('Invite Code: ', req.body.inviteCode);

        let resObj = {
            status:'SUCCESS'
        };

        res.status(200).json(resObj);

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