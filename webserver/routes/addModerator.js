/**
 * Created by Jake on 1/8/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught add moderator request: ', req.body);

    if(typeof(req.user) !== 'undefined'){
        let user = new User();
        user.updateFromUserRecord(req.user.data);

        Team.isMemberModerator(user.id, req.body.teamName, req.body.teamId)
        .then(($isModerator) => {
            if($isModerator){
                return Team.isMember(req.body.memberId, req.body.teamName, req.body.teamId);
            } else {
                return new Promise((resolve, reject) => {
                    reject('must be moderator of team to add moderators');
                });
            }
        })
        .then(($isMember) => {
            if($isMember) {
                return Team.addModerator(req.body.memberId, req.body.teamName, req.body.teamId);
            } else {
                return new Promise((resolve, reject) => {
                    reject('can\'t add non-team members as moderators, must be on team first');
                });
            }
        })
        .then(($dbResult) => {
            //TODO: proper returns
            if($dbResult.records.length > 0){
                //added
                let resObj = {
                    data:{
                    },
                    status:'SUCCESS'
                };

                res.status(200).json(resObj);
            } else {
                //not added
                let resObj = {
                    data:{
                    },
                    status:'FAILED'
                };

                res.status(200).json(resObj);
            }
        })
        .catch(($error) => {
            console.error('Add Moderator Error: ', $error);
            let resObj = {
                error:$error,
                status:'ERROR'
            };
            res.status(400).json(resObj);
        });

        //Check if logged in user is moderator
        //Check if new moderator is member of team
        //Add moderator capabilities


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