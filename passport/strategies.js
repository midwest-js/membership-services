'use strict';

// modules > native
const p = require('path');

// modules > passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const config = require(p.join(process.cwd(), 'server/config/membership'));

const User = require('../services/users/model');

function localCallback(email, password, done) {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) {
      return done(err);
    }

    let message;

    if (user) {
      if (!user.password) {
        message = config.messages.login.notLocal;
      } else if (!user.isEmailVerified) {
        message = config.messages.login.unverified;
      } else if (user.isBlocked) {
        message = config.messages.login.blocked;
      } else if (user.isBanned) {
        message = config.messages.login.banned;
      } else if (!user.authenticate(password)) {
        message = config.messages.login.wrongPassword;
      }
    } else {
      message = config.messages.login.noLocalUser;
    }

    done(null, user, message);
  });
}

passport.use('local', new LocalStrategy(config.passport.local, localCallback));
