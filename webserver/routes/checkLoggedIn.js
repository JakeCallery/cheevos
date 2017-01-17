/**
 * Created by Jake on 1/17/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.all('/', (req, res, next) => {
    req.cheevosData = req.cheevosData || {};

    if(typeof(req.user) == 'undefined'){
        console.log('Not logged in');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        res.status(401).json(resObj);
    } else {
        req.cheevosData.loggedInUser = User.newUserFromDBRecord(req.user.data);
        next();
    }

});

module.exports = router;