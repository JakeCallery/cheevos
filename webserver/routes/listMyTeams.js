/**
 * Created by Jake on 1/4/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught List Teams Request: ', req.body);

    let user = req.cheevosData.sessionUser;
    let resObj = {
        data:{
            teams:[],
            moderatedTeams:[]
        },
        status:'SUCCESS'
    };

    user.getMyTeams()
    .then(($dbResult) => {
        console.log('List My Teams DB Result: ', $dbResult);
        for(let i = 0; i < $dbResult.records.length; i++) {
            let team = $dbResult.records[i].get('team');
            resObj.data.teams.push({
                teamId: team.properties.teamId,
                name: team.properties.teamName
            });
        }
        return user.getTeamsIModerate();
    })
    .then(($dbResult) => {
        console.log('List My Moderated Teams DB Result: ', $dbResult);
        for(let i = 0; i < $dbResult.records.length; i++) {
            let team = $dbResult.records[i].get('moderatedteam');
            resObj.data.moderatedTeams.push({
                teamId: team.properties.teamId,
                name: team.properties.teamName
            });
        }
        res.status(200).json(resObj);
    })
    .catch(($error) => {
        console.log('Error from getMyTeams: ', $error);
        let errorResObj = {};
        errorResObj.status = 'ERROR';
        errorResObj.error = $error;
        res.status(400).json(errorResObj);
    });
});

module.exports = router;