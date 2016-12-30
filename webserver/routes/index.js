const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('Logged In? ', (typeof(req.user) != 'undefined'));
  res.render('dist/index', { title: 'Cheevos Title!!' });
});

module.exports = router;
