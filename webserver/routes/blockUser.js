/**
 * Created by Jake on 1/15/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', (req, res) => {
    console.log('Block User Request...');
    let user = req.cheevosData.sessionUser;
    if(req.body.memberId !== user.data.userId){
        req.cheevosData.sessionUser.blockUser(req.body.memberId)
            .then(($dbResult) => {
                let resObj = {
                    status:'SUCCESS'
                };

                res.status(200).json(resObj);
            })
            .catch(($error) => {
                console.error('blockUser Error: ', $error);
                let resObj = {
                    error:$error,
                    status:'ERROR'
                };
                res.status(400).json(resObj);
            });
    } else {
        let $error = 'Cannot block yourself';
        console.error('blockUser Error: ', $error);
        let resObj = {
            error:$error,
            status:'ERROR'
        };
        res.status(400).json(resObj);
    }

});

module.exports = router;
