/**
 * Created by Jake on 1/3/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught List Members Request: ', req.body);

    if(typeof (req.user) !== 'undefined'){
        let user = new User();
        user.updateFromUserRecord(req.user.data);

        Team.getMembers(req.body.teamName, req.body.teamId)
        .then(($dbResult => {
            console.log('List Memebers DB Result: ', $dbResult);
            let resObj = {
                data:{
                    members:[]
                },
                status:'SUCCESS'
            };

            for(let i = 0; i < $dbResult.records.length; i++) {
                //TODO: Add member information to the response
                //resObj.data[]
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

    } else {
        console.log('Not logged in, can\'t invite member');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        res.status(401).json(resObj);
    }

});

module.exports = router;