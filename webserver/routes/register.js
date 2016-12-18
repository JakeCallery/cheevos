/**
 * Created by Jake on 12/18/2016.
 */
'use strict';

let express = require('express');
let router = express.Router();

router.post('/', function(req, res) {
    // A real world application would store the subscription info.
    res.sendStatus(201);
});

module.exports = router;