/**
 * Created by Jake on 1/15/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BadgeManager = require('../managers/BadgeManager');
const Badge = require('../models/Badge');

//TODO: Maybe only give team moderators the ability to do this?
router.delete('/', (req, res) => {
    if(typeof(req.user) !== 'undefined') {
        let user = User.newUserFromDBRecord(req.user.data);

        BadgeManager.removeBadgeCompletely(user.id, req.body.badgeId)
            .then(($dbResult) => {
                console.log('Badge Removed Completely');
                //Return Success
                let resObj = {
                    status:'SUCCESS'
                };
                res.status(200).json(resObj);
            })
            .catch(($error) => {
                console.log('Badge Remove Error: ', $error);
                let resObj = {
                    error:$error,
                    status:'ERROR'
                };
                res.status(400).json(resObj);
            })

    } else {
        console.log('Not logged in, can\'t send badge...');
        let resObj = {
            error:'NOT_LOGGED_IN',
            status:'ERROR'
        };
        res.status(401).json(resObj);
    }
});

module.exports = router;
