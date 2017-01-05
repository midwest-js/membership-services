'use strict';

const p = require('path');

const _ = require('lodash');
const passport = require('passport');

// const User = require('../services/users/model');

const config = require(p.join(process.cwd(), 'server/config/membership'));

let serializeUser;
let deserializeUser;

const pick = ['id', 'username', 'email', 'roles'];

if (typeof config.serializeUser === 'function') {
  serializeUser = config.serializeUser;
}

if (Array.isArray(config.serializeColumns)) {
  pick.push(...config.serializeColumns);
}
// if (typeof config.serializeUser === 'function') {
//   if (config.serializeUser.length === 1) {
//     serializeUser = config.serializeUser(User);
//   } else {
//     serializeUser = config.serializeUser;
//   }
// }

// if (typeof config.deserializeUser === 'function') {
//   if (config.deserializeUser.length === 1) {
//     deserializeUser = config.deserializeUser(User);
//   } else {
//     deserializeUser = config.deserializeUser;
//   }
// }

// used to serialize the user for the session
passport.serializeUser(serializeUser || ((user, done) => {
  done(null, _.pick(user, pick));
}));

// used to deserialize the user
passport.deserializeUser(deserializeUser || ((user, done) => {
  done(null, user);
}));

require('./req');
require('./strategies');
