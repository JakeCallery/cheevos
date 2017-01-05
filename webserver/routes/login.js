/**
 * Created by Jake on 1/4/2017.
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    console.log('Caught login page request...');

    let isLoggedIn = (typeof(req.user) !== 'undefined');

    if(isLoggedIn) {
        //Just redirect to root
        res.redirect('/');
    } else {
        res.render('dist/login', {
            title: 'Cheevos Login'
        });
    }



});

module.exports = router;
