/**
 * Created by Jake on 1/3/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught List Members Request: ', req.body);

    let user = req.cheevosData.sessionUser;
    Team.getMembers(req.body.teamId)
    .then(($dbResult => {
        console.log('List Memebers DB Result: ', $dbResult);
        let resObj = {
            data:{
                members:[]
            },
            status:'SUCCESS'
        };

        for(let i = 0; i < $dbResult.records.length; i++) {
            let member = $dbResult.records[i].get('member');
            let mod = $dbResult.records[i].get('mod');
            resObj.data.members.push({
                id: member.properties.userId,
                name: member.properties.googleName,
                isMod: mod
            });
        }

        res.status(200).json(resObj);
    }))
    .catch(($error) => {
        console.log('List Members Error: ', $error);
        if($error.hasOwnProperty('error')){
            //we generated the error
            let resObj = {
                error:$error.error,
                status:'ERROR'
            };
            res.status(400).json(resObj);
        }
    });
});

module.exports = router;