/**
 * Created by Jake on 1/15/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
    console.log('List blocked users request...');

    let user = req.cheevosData.sessionUser;
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
                id: blockedUser.properties.userId,
                name: blockedUser.properties.firstName + ' ' + blockedUser.properties.lastName
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
});

module.exports = router;
