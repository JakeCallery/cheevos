/**
 * Created by Jake on 1/15/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BadgeManager = require('../managers/BadgeManager');
const Badge = require('../models/Badge');

router.post('/', (req, res) => {
    console.log('Caught listMyBadges request');
    let user = req.cheevosData.sessionUser;

    //TODO: Implement limits on number of records to return
    if(typeof(req.body.teamId) === 'undefined' || req.body.teamId === ''){
        //List ALL badges
        user.getAllMyBadges()
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
            console.error('listMyBadges Error: ', $error);
            let resObj = {
                error:$error,
                status:'ERROR'
            };
            res.status(400).json(resObj);
        });
    } else {
        //List all badges from team
        user.getMyBadgesOnTeam(req.body.teamId)
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
            console.error('listMyBadges Error: ', $error);
            let resObj = {
                error:$error,
                status:'ERROR'
            };
            res.status(400).json(resObj);
        })
    }
});

module.exports = router;
