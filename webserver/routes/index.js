const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log('Logged In? ', (typeof(req.user) != 'undefined'));
    let isLoggedIn = (typeof(req.user) != 'undefined');
    let googleButtonHref = '/auth/google';
    let googleButtonText = 'Google Login';

    if(isLoggedIn){
        googleButtonHref = '/logout';
        googleButtonText = 'Google Logout';
    }

    res.render('dist/index', {
        title: 'Cheevos Title (Change Me)',
        googleButtonHref: googleButtonHref,
        googleButtonText: googleButtonText
    });
});

module.exports = router;
