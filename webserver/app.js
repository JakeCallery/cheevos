'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('cookie-session');
const passport = require('passport');
const passportConfig = require('./config/passport')(passport);
const helmet = require('helmet');

//Custom requires
const db = require('./config/db');
const User = require('./models/User');


//TODO: Require routes in its own file
const index = require('./routes/index');
const sendNotification = require('./routes/sendNotification');
const authGoogle = require('./routes/authGoogle');
const authGoogleCallback = require('./routes/authGoogleCallback');
const logout = require('./routes/logout');
const registerSubscription = require('./routes/registerSubscription');
const sendCheevo = require('./routes/sendCheevo');
const createTeam = require('./routes/createTeam');
const inviteMember = require('./routes/inviteMember');
const invited = require('./routes/invited');
const acceptInvite = require('./routes/acceptInvite');
const listMembers = require('./routes/listMembers');

//Set up express
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.set('view engine', 'html');
app.set('trust proxy', 1);
app.engine('html', ejs.renderFile);

//TODO: Favicon
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//TODO: More Security:
//https://expressjs.com/en/advanced/best-practice-security.html

//TODO: externalize keys
app.use(session({
    name: 'session',
    keys: ['6bXufH9qXWmZhQznx33QY26QV','5BBqd75pQ3mMwKohtSjf8Thqp'],
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//Set up passport
app.use(passport.initialize());
app.use(passport.session());

//Assign routes
app.use('/', index);
app.use('/api/sendNotification', sendNotification);
app.use('/auth/google', authGoogle);
app.use('/auth/google/callback', authGoogleCallback);
app.use('/logout', logout);
app.use('/api/registerSubscription', registerSubscription);
app.use('/api/sendCheevo', sendCheevo);
app.use('/api/createTeam', createTeam);
app.use('/api/inviteMember', inviteMember);
app.use('/api/acceptInvite', acceptInvite);
app.use('/invited', invited);
app.use('/api/listMembers', listMembers);

//TODO: Fix up static serving so that index.html is not static served when
//express.static is above the session setup

//TODO: Put static serving BEFORE session setup:
//https://www.airpair.com/express/posts/expressjs-and-passportjs-sessions-deep-dive

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
