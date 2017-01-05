/**
 * Created by Jake on 12/28/2016.
 */
const express = require('express');
const router = express.Router();
const passport = require('passport');

//TODO: Fill out login Failed Page
router.get('/', passport.authenticate('google', {failureRecirect: '/loginFailed'}),
    (req, res) => {
    let successRedirect = null;

    if(typeof(req.session) !== 'undefined' && typeof(req.session.initialPath) !== 'undefined'){
        //Redirect back to initial landing page
        successRedirect = req.session.initialPath;
        delete req.session.initialPath;

        console.log('Login Redirect Path: ', successRedirect);

    } else {
        //default to root
        successRedirect = '/';
    }

    res.redirect(successRedirect);
});

module.exports = router;

