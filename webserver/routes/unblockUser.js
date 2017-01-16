/**
 * Created by Jake on 1/15/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', (req, res) => {
    console.log('UnBlock user request...');
    if(typeof(req.user) !== 'undefined') {
        let user = User.newUserFromDBRecord(req.user.data);
        user.unblockUser(req.body.userIdToUnblock)
        .then(($dbResult) => {
            let resObj = {
                status:'SUCCESS'
            };
            res.status(200).json(resObj);
        })
        .catch(($error) => {
            console.error('unblockUser Error: ', $error);
            let resObj = {
                error:$error,
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