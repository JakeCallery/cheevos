/**
 * Created by Jake on 2/9/2017.
 */
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {

    res.render('dist/team', {
        title: 'Cheevos Team Page'
    });
});

module.exports = router;
