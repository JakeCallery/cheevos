/**
 * Created by Jake on 12/19/2016.
 */

'use strict';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const authConfig = require('../keys/authConfig.js');
const User = require('../models/User');

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
            process.nextTick(() => {
                //Look up user based on profile.id
                User.findById(profile.id)
                    .then(($user) => {
                      if($user){
                          console.log('Found User: ', $user.data.name);
                          return done(null, $user);
                      } else {
                          //create new user
                          console.log('Creating New User');
                          let newUser = new User();
                          newUser.data.google.id = profile.id;
                          newUser.data.google.accessToken = accessToken;
                          newUser.data.google.refreshToken = refreshToken;
                          newUser.data.google.name = profile.displayName;
                          newUser.data.google.email = profile.emails[0].value;

                          // newUser.saveToDB(($err) => {
                          //       if($err){
                          //           throw $err;
                          //       }
                          //       console.log('New User Created');
                          //       return done(null, newUser);
                          // });
                      }
                    })
                    .catch((error) => {
                        console.error('Error: ', error);
                    });

                //if error, show error
                //if user is found, return done(null, user);
                //if user is not found
                //create a new user in the DB
                //store the id, token, name, email
                //save the user
                //return done(null, newUser)
                console.log('AccessToken: ', accessToken);
                console.log('refreshToken: ', refreshToken);
                console.log('profiles: ', profile);
                done(null, profile);
            });
        }
    ));
};
