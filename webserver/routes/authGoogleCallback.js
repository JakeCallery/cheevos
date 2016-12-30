/**
 * Created by Jake on 12/28/2016.
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('google', {
        successRedirect: '/',
        failureRecirect: '/loginFailed'
    }));


module.exports = router;

