const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    //TODO: Proper user check if the user check code changed or something
    let isLoggedIn = (typeof(req.user) !== 'undefined');
    let isSubscribed = false;

    console.log('==============Logged In? ', isLoggedIn);

    if(isLoggedIn){
        //App page
        res.render('dist/app', {
            title: 'Cheevos Title (Change Me)',
            isLoggedIn: isLoggedIn,
            isSubscribed: isSubscribed,
            userName: req.user.firstName + ' ' + req.user.lastName,
            profileImageUrl: req.user.profileImg,
        });
    } else {
        //landing page
        res.render('dist/landing', {
            title: 'Cheevos Landing Page (Change Me)'
        });
    }

});

module.exports = router;
