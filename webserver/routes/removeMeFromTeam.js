/**
 * Created by Jake on 1/6/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught Remove Me Request', req.body);

    if(typeof(req.user) !== 'undefined'){

        //TODO: DB look up, returning success for testing for now
        let resObj = {
            data:{
            },
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