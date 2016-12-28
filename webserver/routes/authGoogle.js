/**
 * Created by Jake on 12/28/2016.
 */
'use strict';

let express = require('express');
let router = express.Router();
let passport = require('passport');

router.get('/',passport.authenticate('google', {scope : ['profile', 'email'] }));


module.exports = router;

