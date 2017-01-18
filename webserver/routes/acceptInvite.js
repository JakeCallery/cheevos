/**
 * Created by Jake on 1/1/2017.
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const InviteManager = require('../managers/InviteManager');

router.post('/', (req, res) => {
     console.log('Caught request to accept an invite');

    let user = req.cheevosData.sessionUser;
    console.log('Invite Code: ', req.body.inviteCode);
    user.acceptInvite(req.body.inviteCode)
    .then(($dbResult) => {
        console.log('Caught Accept Invite results: ', $dbResult);
        return InviteManager.removeInvite(req.body.inviteCode);
    })
    .then(() => {
        console.log('Removed Invite..');
        let resObj = {
            status:'SUCCESS',
        };
        res.status(200).json(resObj);
    })
    .catch(($error) => {
        console.log('Accept Invite Top Level Error: ', $error);
        let resObj = {
            error:'ACCEPT_INVITE_ERROR',
            status:'ERROR',
            message:$error
        };
        res.status(404).json(resObj);
    });
});

module.exports = router;