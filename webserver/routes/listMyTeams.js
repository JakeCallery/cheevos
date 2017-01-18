/**
 * Created by Jake on 1/4/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught List Teams Request: ', req.body);

    let user = req.cheevosData.loggedInUser;
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

        //TODO: !!BUG!! Returns duplicate team names and ids
        for(let i = 0; i < $dbResult.records.length; i++) {
            let team = $dbResult.records[i].get('team');
            let moderatedTeam = $dbResult.records[i].get('moderatedteam');
            resObj.data.teams.push({
                id: team.properties.teamId,
                name: team.properties.teamName
            });

            if(typeof(moderatedTeam) !== 'undefined'){
                resObj.data.moderatedTeams.push({
                    id: moderatedTeam.properties.teamId,
                    name: moderatedTeam.properties.teamName
                });
            }
        }
        res.status(200).json(resObj);
    })
    .catch(($error) => {
        console.log('Error from getMyTeams: ', $error);
        resObj.status = 'ERROR';
        resObj.error = $error;
        res.status(200).json(resObj);
    });
});

module.exports = router;