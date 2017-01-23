/**
 * Created by Jake on 1/22/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught getTeamNotificationsEnabled: ', req.body.teamId);
    let user = req.cheevosData.sessionUser;
    user.getTeamNotificationsEnabled(req.body.teamId)
    .then(($dbResult) => {
        let resObj = {};

        if($dbResult.records.length === 1){
            resObj.teamNotificationsEnabled = $dbResult.records[0].get('rel').properties.notificationsEnabled;
            resObj.status = 'SUCCESS';
            res.status(200).json(resObj);
        } else {
            resObj.status = 'ERROR';
            resObj.error = 'Expected 1 records, got: ' + $dbResult.records.length;
            res.status(400).json(resObj);
        }
    })
    .catch(($error) => {
        console.log('getTeamNotificationsEnabled error: ', $erro);
        let errorResObj = {};
        errorResObj.status = 'ERROR';
        errorResObj.error = $error;
        res.status(400).json(errorResObj);
    });


});

module.exports = router;