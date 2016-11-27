'use strict';

const p = require('path');

const _ = require('lodash');
const passport = require('passport');

// const User = require('../services/users/model');

const config = require(p.join(process.cwd(), 'server/config/membership'));

let serializeUser;
let deserializeUser;

if (typeof config.serializeUser === 'function') {
  if (config.serializeUser.length === 1) {
    serializeUser = config.serializeUser(User);
  } else {
    serializeUser = config.serializeUser;
  }
}

if (typeof config.deserializeUser === 'function') {
  if (config.deserializeUser.length === 1) {
    deserializeUser = config.deserializeUser(User);
  } else {
    deserializeUser = config.deserializeUser;
  }
}
// used to serialize the user for the session
passport.serializeUser(serializeUser || ((user, done) => {
  done(null, _.pick(user, ['id', 'username', 'email', 'roles']));
}));

// used to deserialize the user
passport.deserializeUser(deserializeUser || ((user, done) => {
  done(null, user);
  // User.findById(user, (err, user) => {
  //   done(err, user);
  // });
}));

require('./req');
require('./strategies');
