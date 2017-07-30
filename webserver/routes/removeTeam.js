/**
 * Created by Jake on 1/8/2017.
 */
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');

router.delete('/', (req, res) => {
    console.log('Caught Remove Team Request');

    let user = req.cheevosData.sessionUser;
    Team.isMemberModerator(user.id, req.body.teamId)
    .then(($isModerator) => {
        if($isModerator) {
            return Team.removeTeam(req.body.teamId);
        } else {
            return new Promise((resolve, reject) => {
                reject('ACCESS_DENIED');
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
        if($error === 'ACCESS_DENIED'){
            resObj.message =  'Only team moderators may remove the team';
            res.status(401).json(resObj);
        } else {
            res.status(400).json(resObj);
        }

    });
});

module.exports = router;