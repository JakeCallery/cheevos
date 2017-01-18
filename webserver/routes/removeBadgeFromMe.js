/**
 * Created by Jake on 1/15/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BadgeManager = require('../managers/BadgeManager');
const Badge = require('../models/Badge');

router.delete('/', (req, res) => {
    let user = req.cheevosData.sessionUser;
    BadgeManager.removeBadgeForUser(user.id, req.body.badgeId)
    .then(($dbResult) => {
        console.log('Badge Removed For user');
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
    });
});

module.exports = router;