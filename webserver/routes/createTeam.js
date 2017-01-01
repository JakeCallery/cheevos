/**
 * Created by Jake on 1/1/2017.
 */

const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const shortId = require('shortid');
const User = require('../models/User');

router.post('/', (req, res) => {
    console.log('Caught Create Team Request');
    if(typeof (req.user) !== 'undefined'){
        console.log('Logged in, creating team...');

        let user = new User();
        user.updateFromUserRecord(req.user.data);

        //TODO: Sanitize team name from request?
        console.log('Requesting with googleID: ' + user.id);
        Team.createTeam(req.body.teamName, shortId.generate(), user.id)
            .then(($dbResult) => {
                console.log('Create Team Result: ', $dbResult);

                //TODO: return JSON result here
                let resObj = {
                    status:'SUCCESS'
                };
                res.status(200).json(resObj);
            })
            .catch(($error) => {
                console.log('Create Team Error: ', $error);
                if($error.hasOwnProperty('error')){
                    //we generated the error
                    let resObj = {
                        error:$error.error,
                        status:'ERROR'
                    };

                    if($error.error === 'ALREADY_EXISTS'){
                        //Team Already exists
                        console.log('Team Already Exists');
                    } else {
                        //Other error
                        console.log('Other Error: ', $error.error, ':', $error.message);
                    }

                    res.status(400).json(resObj);
                }
            });

    } else {
        //not logged in
        console.log('Not logged in, can\'t store endpoint...');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        res.status(401).json(resObj);
    }
});

module.exports = router;