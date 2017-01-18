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
        //Store only user ID in session, look up user from DB when needed
        //Might be worth storing whole user or something for less DB access
        //TODO: Look into optimization here

        let sessionUser = {
            id: user.id,
            name: user.name
        };
        done(null, user);
    });

    passport.deserializeUser((sessionUser, done) => {
        //TODO: Optimize by NOT going to the DB to build the user.
        //Build user from session info only:
        //https://www.airpair.com/express/posts/expressjs-and-passportjs-sessions-deep-dive
        //console.log('DeserializeUser Called: ', id);
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
                        email: profile.emails[0].value,
                        accessToken: accessToken,
                        refreshToken:  refreshToken
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
