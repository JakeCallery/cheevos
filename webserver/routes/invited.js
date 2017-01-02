/**
 * Created by Jake on 1/1/2017.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/:code', (req, res) => {
    console.log('Caught Invited Request: ', req.params.code);
    res.render('invited', {
        code: req.params.code
    });
});

module.exports = router;