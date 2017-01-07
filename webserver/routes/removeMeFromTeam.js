/**
 * Created by Jake on 1/6/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.delete('/', (req, res) => {
    console.log('Caught Remove Me Request', req.body);

    if(typeof(req.user) !== 'undefined'){
        let user = new User();
        user.updateFromUserRecord(req.user.data);

        Team.removeMember(user.id, req.body.teamName, req.body.teamId)
        .then(($dbResult) => {
            console.log('Num Results: ', $dbResult.records.length);
            //TODO: Proper return if no records were found
            let resObj = {
                data:{
                },
                status:'SUCCESS'
            };

            res.status(200).json(resObj);

        })
        .catch(($error) => {
            console.error('Remove Me From Team Error: ', $error);
                        let resObj = {
                error:$error,
                status:'ERROR'
            };
            res.status(400).json(resObj);

        });


    } else {
        console.log('Not logged in, can\'t remove member');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        res.status(401).json(resObj);
    }
});

module.exports = router;