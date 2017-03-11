/**
 * Created by Jake on 2/9/2017.
 */
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {

    let isLoggedIn = (typeof(req.user) !== 'undefined');
    let isSubscribed = false;

    res.render('dist/team', {
        title: 'Cheevos Team Page',
        isLoggedIn: isLoggedIn,
        isSubscribed: isSubscribed,
        userName: req.user.firstName + ' ' + req.user.lastName,
        profileImageUrl: req.user.profileImg,
    });
});

module.exports = router;
