/**
 * Created by Jake on 1/15/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
    console.log('List blocked users request...');

    if(typeof(req.user) !== 'undefined') {
        let user = User.newUserFromDBRecord(req.user.data);

        user.getBlockedUsers()
        .then(($dbResult) => {
            console.log('Blocked Users: ' + $dbResult.records.length);
            let resObj = {
                data:{
                    blockedUsers:[]
                },
                status:'SUCCESS'
            };

            for(let i = 0; i < $dbResult.records.length; i++){
                let blockedUser = $dbResult.records[i].get('blockedUser');
                resObj.data.blockedUsers.push({
                    id: blockedUser.properties.googleId,
                    name: blockedUser.properties.googleName
                });
            }

            res.status(200).json(resObj);

        })
        .catch(($error) => {
            console.error('listBlockedUsers Error: ', $error);
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