/**
 * Created by Jake on 12/28/2016.
 */

'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
