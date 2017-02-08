/**
 * Created by Jake on 2/7/2017.
 */
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    //TODO: Proper user check if the user check code changed or something
    let isLoggedIn = (typeof(req.user) !== 'undefined');
    let isSubscribed = false;

    console.log('==============Logged In? ', isLoggedIn);

    res.render('dist/apitest', {
        title: 'API Test Page',
        isLoggedIn: isLoggedIn,
        isSubscribed: isSubscribed
    });
});

module.exports = router;
