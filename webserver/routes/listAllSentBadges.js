/**
 * Created by Jake on 1/16/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BadgeManager = require('../managers/BadgeManager');
const Badge = require('../models/Badge');

router.get('/', (req,res) => {
    if(typeof(req.user) !== 'undefined') {
        let user = User.newUserFromDBRecord(req.user.data);

        user.getAllSentBadges()
        .then(($dbResult) => {
            let resObj = {
                data:{
                    badges:[]
                },
                status:'SUCCESS'
            };

            for(let i = 0; i < $dbResult.records.length; i++) {
                let dbBadge = $dbResult.records[i].get('badge');
                resObj.data.badges.push(Badge.newBadgeFromDB(dbBadge).json());
            }

            res.status(200).json(resObj);
        })
        .catch(($error) => {
            console.error('listAllSentBadges Error: ', $error);
            let resObj = {
                error:$error,
                status:'ERROR'
            };
            res.status(400).json(resObj);
        });

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
