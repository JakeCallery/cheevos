/**
 * Created by Jake on 1/1/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:code', (req, res) => {

    if(typeof(req.user) !== 'undefined'){
        console.log('Caught Invited Request: ', req.params.code);
        res.render('dist/invited', {
            code: req.params.code
        });
    } else {
        //redirect to login
        req.session.initialPath = "/invited" + req.path;
        res.redirect('/login');
    }

});

module.exports = router;