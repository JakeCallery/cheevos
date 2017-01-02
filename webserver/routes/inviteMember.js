/**
 * Created by Jake on 1/1/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught Invite Member Request: ', req.body);

    if(typeof (req.user) !== 'undefined'){
        let user = new User();
        user.updateFromUserRecord(req.user.data);

        //TODO: Sanitize req.body?
        Team.inviteMember(user.id, req.body.email, req.body.teamName, req.body.teamId)
        .then(($dbResult) => {

            //TODO: Properly handle response from DB

            console.log('Invite Result: ', $dbResult);
            let resObj = {
                status:'SUCCESS'
            };
            res.status(200).json(resObj);
        })
        .catch(($error) => {
            console.log('Invite Member Error: ', $error);
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