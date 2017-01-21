/**
 * Created by Jake on 1/6/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.delete('/', (req, res) => {
    console.log('Caught Remove Me Request', req.body);

    let user = req.cheevosData.sessionUser;
    Team.isMemberOnlyModerator(user.id, req.body.teamId)
    .then(($isOnlyModerator) => {
        if($isOnlyModerator === false){
            Team.removeMember(user.id, req.body.teamId)
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
});

module.exports = router;