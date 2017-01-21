/**
 * Created by Jake on 12/19/2016.
 */

'use strict';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const authConfig = require('../keys/authConfig.js');
const User = require('../models/User');

module.exports = function(passport){
    passport.serializeUser((user, done) => {
        console.log('Serialize User Called: ', user.id);
        let sessionUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            authType: user.authType,
            profileImg: user.profileImg
        };
        done(null, sessionUser);
    });

    passport.deserializeUser((sessionUser, done) => {
        done(null,sessionUser);
    });

    passport.use(new GoogleStrategy(
        authConfig.googleAuth,
        (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
                let idObj = {
                    google: {
                        id: profile.id,
                        name: profile.displayName,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                        accessToken: accessToken,
                        refreshToken:  refreshToken,
                        profileImg: profile.photos[0].value,
                        provider: profile.provider
                    }
                };
                User.findOrCreate(idObj)
                    .then((user) => {
                        console.log('******** Find or Create User: ', user.id);
                        done(null, user);
                    })
                    .catch((error) => {
                        console.error('Error: ', error);
                        done(null,false);
                    });
            });
        }
    ));
};
