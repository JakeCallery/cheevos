/**
 * Created by Jake on 3/12/2017.
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('dist/invitedNotLoggedIn', {
        title: 'Invited'
    });
});

module.exports = router;