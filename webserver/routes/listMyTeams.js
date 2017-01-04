/**
 * Created by Jake on 1/4/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught List Teams Request: ', req.body);

    if(typeof (req.user) !== 'undefined'){
        let user = new User();
        user.updateFromUserRecord(req.user.data);

        //TODO: Grab teams from db
        //we generated the error
        let resObj = {
            status:'SUCCESS'
        };
        res.status(200).json(resObj);

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