/**
 * Created by Jake on 1/1/2017.
 */

const express = require('express');
const router = express.Router();
const shortId = require('shortid');
const promiseRetry = require('promise-retry');

const Team = require('../models/Team');
const User = require('../models/User');

router.post('/', (req, res) => {
    console.log('Caught Create Team Request');
    let user = req.cheevosData.sessionUser;

    //TODO: Sanitize team name from request?
    console.log('Requesting with ID: ' + user.id);
    promiseRetry((retry, attempt) => {
        console.log('CreateTeam attempt: ' + attempt);
        return Team.createTeam(req.body.teamName, user.id)
        .then(($dbResult) => {
            console.log('Create Team Result: ', $dbResult);

            //TODO: return JSON result here
            let resObj = {
                status:'SUCCESS'
            };
            res.status(200).json(resObj);
        })
        .catch(($error) => {
            if ($error.fields[0].code == 'Neo.ClientError.Schema.ConstraintValidationFailed') {
                console.log('duplicate team id, retrying: ' + attempt);
                retry('create team duplicate id');
            } else {
                console.error('Team Creation Failed: ', $error);
                let resObj = {
                    error: $error,
                    status: 'ERROR'
                };
                res.status(400).json(resObj);
            }
        });
    },{retries:3})
    .catch(($error) => {
        console.error('createTeam Failed: ', $error);
        let resObj = {
            error: $error,
            status: 'ERROR'
        };
        res.status(400).json(resObj);
    });


});

module.exports = router;