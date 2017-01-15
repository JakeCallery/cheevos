/**
 * Created by Jake on 1/8/2017.
 */
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');

router.delete('/', (req, res) => {
    console.log('Caught Remove Team Request');

    if(typeof (req.user) !== 'undefined'){
        let user = new User();
        user.updateFromUserRecord(req.user.data);

        Team.isMemberModerator(user.id, req.body.teamName, req.body.teamId)
        .then(($isModerator) => {
            if($isModerator) {
                return Team.removeTeam(req.body.teamName, req.body.teamId);
            } else {
                return new Promise((resolve, reject) => {
                    reject('Only team moderators may remove a team');
                });
            }
        })
        .then(($dbResult) => {
            console.log('Removed Team: ', $dbResult.records.length);
            //TODO: return proper result here
            let resObj = {
                status:'SUCCESS'
            };
            res.status(200).json(resObj);
        })
        .catch(($error) => {
            let resObj = {
                error: $error,
                status: 'ERROR'
            };
            res.status(400).json(resObj);
        });

    } else {
        //not logged in
        console.log('Not logged in, can\'t store endpoint...');
        let resObj = {
            error: 'NOT_LOGGED_IN',
            status: 'ERROR'
        };
        res.status(401).json(resObj);
    }
});

module.exports = router;