'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./config/passport')(passport);
const db = require('./config/db');
const User = require('./models/User');

//TODO: Require routes in its own file
const index = require('./routes/index');
const sendNotification = require('./routes/sendNotification');
const authGoogle = require('./routes/authGoogle');
const authGoogleCallback = require('./routes/authGoogleCallback');
const logout = require('./routes/logout');
const registerSubscription = require('./routes/registerSubscription');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

//TODO: Favicon
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '6bXufH9qXWmZhQznx33QY26QV',
  resave: false,
  saveUninitialized: false
}));

//Set up passport
app.use(passport.initialize());
app.use(passport.session());

//Assign routes
app.use('/', index);
app.use('/sendNotification', sendNotification);
app.use('/auth/google', authGoogle);
app.use('/auth/google/callback', authGoogleCallback);
app.use('/logout', logout);
app.use('/registerSubscription', registerSubscription);

//Set static serving
app.use(express.static(path.join(__dirname, 'views/dist')));
console.log(__dirname);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
