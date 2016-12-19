/**
 * Created by Jake on 12/19/2016.
 */

'use strict';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const authConfig = require('../keys/authConfig.js');

module.exports = function(passport){
    passport.serializeUser((user, done) => {
        console.log('Serialize User Called: ', user);
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        // User.findById(id, function(err, user) {
        //     done(err, user);
        // });
        console.log('DeserializeUser Called: ', id);
        done(null, id);
    });

    passport.use(new GoogleStrategy(
         authConfig.googleAuth,
        (accessToken, refreshToken, profile, done) => {
           console.log('AccessToken: ', accessToken);
           console.log('refreshToken: ', refreshToken);
           console.log('profiles: ', profile);
           done(null, profile);
        }
    ));
};
