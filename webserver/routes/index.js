const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log('Logged In? ', (typeof(req.user) != 'undefined'));
    let isLoggedIn = (typeof(req.user) != 'undefined');
    let isSubscribed = false;

    res.render('dist/index', {
        title: 'Cheevos Title (Change Me)',
        isLoggedIn: isLoggedIn,
        isSubscribed: isSubscribed
    });
});

module.exports = router;
