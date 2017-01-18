/**
 * Created by Jake on 1/7/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.delete('/', (req, res) => {
    console.log('Caught Remove Member request: ', req.body);

    let user = req.cheevosData.loggedInUser;
    if(user.id === req.body.memberId){
        //Remove myself from team:
        Team.isMemberOnlyModerator(user.id, req.body.teamName, req.body.teamId)
            .then(($isOnlyModerator) => {
                if($isOnlyModerator === false){
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
                } else {
                    let resObj = {
                        error:'Can\'t remove only moderator from team',
                        status:'ERROR'
                    };
                    res.status(400).json(resObj);
                }
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
        //Check if moderator and then remove member
        Team.isMemberModerator(user.id, req.body.teamName, req.body.teamId)
        .then(($isModerator) => {
            if($isModerator === true){
                Team.removeMember(req.body.memberId, req.body.teamName, req.body.teamId)
                .then(($dbResult) => {
                    if($dbResult.records.length > 0) {
                        console.log('Num Results: ', $dbResult.records.length);
                        //TODO: Proper return if no records were found
                        let resObj = {
                            data:{
                            },
                            status:'SUCCESS'
                        };

                        res.status(200).json(resObj);
                    } else {
                        return new Promise((resolve, reject) => {
                            let resObj = {
                                error:'Member not found on team.',
                                status:'ERROR'
                            };
                            res.status(400).json(resObj);
                        });
                    }
                })
                .catch(($error) => {
                    return new Promise((resolve, reject) => {
                        reject($error);
                    });
                });
            } else {
                console.log('Not Moderator of team, can\'t remove member');
                let resObj = {
                    error:'ACCESS_DENIED',
                    status:'ERROR'
                };
                res.status(401).json(resObj);
            }
        })
        .catch(($error) => {
            console.error('Remove Member From Team Error: ', $error);
            let resObj = {
                error:$error,
                status:'ERROR'
            };
            res.status(400).json(resObj);
        });
    }
});

module.exports = router;