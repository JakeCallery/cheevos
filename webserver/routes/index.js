const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    //TODO: Proper user check if the user check code changed or something
    let isLoggedIn = (typeof(req.user) !== 'undefined');
    let isSubscribed = false;

    console.log('==============Logged In? ', isLoggedIn);

    res.render('dist/index', {
        title: 'Cheevos Title (Change Me)',
        isLoggedIn: isLoggedIn,
        isSubscribed: isSubscribed
    });
});

module.exports = router;
