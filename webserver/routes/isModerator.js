/**
 * Created by Jake on 1/7/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');

router.post('/', (req, res) => {
    console.log('Caught isModerator request: ', req.body);

    let user = req.cheevosData.sessionUser;

    Team.isMemberModerator(user.id, req.body.teamName, req.body.teamId)
    .then(($result) => {
        console.log('isModerator: ', $result);
        let resObj = {
            isModerator: $result,
            status:'SUCCESS'
        };
        res.status(200).json(resObj);
    })
    .catch(($error) => {
        console.log('isModerator Error: ', $error);
        let resObj = {
            error:$error,
            status:'ERROR'
        };
        res.status(400).json(resObj);
    });
});

module.exports = router;
