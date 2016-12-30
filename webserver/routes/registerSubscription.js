/**
 * Created by Jake on 12/30/2016.
 */
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    console.log('Caught Register Subscription request: ', req.body);

    if(typeof (req.user) !== 'undefined'){
        console.log('Logged in, storing endpoint');
        let resObj = {
            status:'SUCCESS'
        };
        res.status(202).json(resObj);
    } else {
        console.log('Not logged in, can\'t store endpoint...');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        res.status(401).json(resObj);
    }

});

module.exports = router;