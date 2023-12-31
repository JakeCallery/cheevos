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

//Serially wait for DB to be ready
//TODO: Still need to do this
//////////////////////////////////


//TODO: Require routes in its own file
//Basic Pages
const indexPage = require('./routes/indexPage');
const apitestPage = require('./routes/apitestPage');
const teamPage = require('./routes/teamPage');

//Login/out
const login = require('./routes/login');
const logout = require('./routes/logout');

//Google Auth
const authGoogle = require('./routes/authGoogle');
const authGoogleCallback = require('./routes/authGoogleCallback');

//Api
const registerSubscription = require('./routes/registerSubscription');
const sendBadge = require('./routes/sendBadge');
const createTeam = require('./routes/createTeam');
const inviteMember = require('./routes/inviteMember');
const invited = require('./routes/invited');
const invitedNotLoggedIn = require('./routes/invitedNotLoggedIn');
const acceptInvite = require('./routes/acceptInvite');
const listMembers = require('./routes/listMembers');
const listMyTeams = require('./routes/listMyTeams');
const removeMeFromTeam = require('./routes/removeMeFromTeam');
const isModerator = require('./routes/isModerator');
const isOnlyModerator = require('./routes/isOnlyModerator');
const removeMemberFromTeam = require('./routes/removeMemberFromTeam');
const addModerator = require('./routes/addModerator');
const removeModerator = require('./routes/removeModerator');
const removeTeam = require('./routes/removeTeam');
const removeBadgeFromMe = require('./routes/removeBadgeFromMe');
const removeBadgeCompletely = require('./routes/removeBadgeCompletely');
const listMyBadges = require('./routes/listMyBadges');
const blockUser = require('./routes/blockUser');
const unblockUser = require('./routes/unblockUser');
const listBlockedUsers = require('./routes/listBlockedUsers');
const listAllSentBadges = require('./routes/listAllSentBadges');
const listBadgesSentToUser = require('./routes/listBadgesSentToUser');
const listBadgesSentToUserOnTeam = require('./routes/listBadgesSentToUserOnTeam');
const checkLoggedIn = require('./routes/checkLoggedIn');
const enableTeamNotifications = require('./routes/enableTeamNotifications');
const disableTeamNotifications = require('./routes/disableTeamNotifications');
const getTeamNotificationsEnabled = require('./routes/getTeamNotificationsEnabled');

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

//Page routes
app.use('/', indexPage);
app.use('/invited', invited);
app.use('/invitedNotLoggedIn', invitedNotLoggedIn);
app.use('/apitest', apitestPage);
app.use('/teams', teamPage);

//Auth Routes
app.use('/auth/google', authGoogle);
app.use('/auth/google/callback', authGoogleCallback);
app.use('/login', login);
app.use('/logout', logout);


//Api Routes
app.use('/api/*', checkLoggedIn);
app.use('/api/registerSubscription', registerSubscription);
app.use('/api/sendBadge', sendBadge);
app.use('/api/createTeam', createTeam);
app.use('/api/inviteMember', inviteMember);
app.use('/api/acceptInvite', acceptInvite);
app.use('/api/listMembers', listMembers);
app.use('/api/listMyTeams', listMyTeams);
app.use('/api/removeMeFromTeam', removeMeFromTeam);
app.use('/api/isModerator', isModerator);
app.use('/api/isOnlyModerator', isOnlyModerator);
app.use('/api/removeMemberFromTeam', removeMemberFromTeam);
app.use('/api/addModerator', addModerator);
app.use('/api/removeModerator', removeModerator);
app.use('/api/removeTeam', removeTeam);
app.use('/api/removeBadgeFromMe', removeBadgeFromMe);
app.use('/api/removeBadgeCompletely', removeBadgeCompletely);
app.use('/api/listMyBadges', listMyBadges);
app.use('/api/blockUser', blockUser);
app.use('/api/unblockUser', unblockUser);
app.use('/api/listBlockedUsers', listBlockedUsers);
app.use('/api/listAllSentBadges', listAllSentBadges);
app.use('/api/listBadgesSentToUser', listBadgesSentToUser);
app.use('/api/listBadgesSentToUserOnTeam', listBadgesSentToUserOnTeam);
app.use('/api/enableTeamNotifications', enableTeamNotifications);
app.use('/api/disableTeamNotifications', disableTeamNotifications);
app.use('/api/getTeamNotificationsEnabled', getTeamNotificationsEnabled);

//TODO: Fix up static serving so that indexPage.html is not static served when
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
