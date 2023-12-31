/**
 * Created by Jake on 1/3/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const neo4j = require('neo4j-driver').v1;

router.post('/', (req, res) => {
    console.log('Caught List Members Request: ', req.body);

    let user = req.cheevosData.sessionUser;
    Team.getMembers(req.body.teamId, user.data.userId)
    .then(($dbResult => {
        console.log('List Memebers DB Result: ', $dbResult);
        let resObj = {
            data:{
                members:[],
                teamId:req.body.teamId,
                myId: user.data.userId
            },
            status:'SUCCESS'
        };

        for(let i = 0; i < $dbResult.records.length; i++) {
            let member = $dbResult.records[i].get('member');
            let authType = member.properties.authType;
            let isBlocked = neo4j.int($dbResult.records[i].get('isBlocked')).toNumber();
            let isMod = neo4j.int($dbResult.records[i].get('isMod')).toNumber();

            resObj.data.myId = user.data.userId;

            resObj.data.members.push({
                id: member.properties.userId,
                name: member.properties.firstName + ' ' + member.properties.lastName,
                profileImg: member.properties[authType+'ProfileImg'],
                isBlocked: (isBlocked === 1),
                isMod: (isMod === 1)
            });
        }

        res.status(200).json(resObj);
    }))
    .catch(($error) => {
        console.log('List Members Error: ', $error);
        let resObj = {
            status:'ERROR'
        };
        if($error.hasOwnProperty('error')){
            //we generated the error
            resObj.error = $error.error;
        } else {
            resObj.error = $error
        }
        res.status(400).json(resObj);

    });
});

module.exports = router;