/**
 * Created by Jake on 1/8/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught remove moderator request: ', req.body);

    let user = req.cheevosData.sessionUser;

    //can't remove yourself
    if(user.id == req.body.memberId){

        let $error = 'Remove Moderator Error: ' + 'Can\'t remove yourself as moderator';
        console.error($error);
        let resObj = {
            error: $error,
            status:'ERROR'
        };
        res.status(400).json(resObj);
        return;
    }


    Team.isMemberModerator(user.id, req.body.teamId)
    .then(($isModerator) => {
        if($isModerator){
            return Team.isMember(req.body.memberId, req.body.teamId);
        } else {
            return new Promise((resolve, reject) => {
                reject('must be moderator of team to remove moderators');
            });
        }
    })
    .then(($isMember) => {
        if($isMember) {
            return Team.removeModerator(req.body.memberId,req.body.teamId);
        } else {
            return new Promise((resolve, reject) => {
                reject('can\'t remove non-team members as moderators, must be on team first');
            });
        }
    })
    .then(($dbResult) => {
        //TODO: proper returns
        if($dbResult.records.length > 0){
            //Removed
            let resObj = {
                data:{
                },
                status:'SUCCESS'
            };

            res.status(200).json(resObj);
        } else {
            //Removed
            let resObj = {
                data:{
                },
                status:'FAILED'
            };

            res.status(200).json(resObj);
        }
    })
    .catch(($error) => {
        console.error('Remove Moderator Error: ', $error);
        let resObj = {
            error:$error,
            status:'ERROR'
        };
        res.status(400).json(resObj);
    });
});

module.exports = router;