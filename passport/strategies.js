'use strict';

// modules > native
const p = require('path');

// modules > passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const config = require(p.join(process.cwd(), 'server/config/membership'));

const { getAuthenticationDetails } = require('../services/users/handlers');
const { authenticate } = require('../services/users/helpers');

function localCallback(email, password, done) {
  getAuthenticationDetails(email.toLowerCase(), (err, user) => {
    if (err) {
      return done(err);
    }

    let message;

    if (user) {
      if (!user.password) {
        message = config.messages.login.notLocal;
      } else if (!user.dateEmailVerified) {
        message = config.messages.login.emailNotUnverified;
      } else if (user.dateBlocked) {
        message = config.messages.login.blocked;
      } else if (user.dateBanned) {
        message = config.messages.login.banned;
      } else if (!authenticate(password, user.password)) {
        message = config.messages.login.wrongPassword;
      }
    } else {
      message = config.messages.login.noLocalUser;
    }

    done(null, user, message);
  });
}

passport.use('local', new LocalStrategy(config.passport.local, localCallback));
