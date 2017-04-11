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
  getAuthenticationDetails(email.toLowerCase()).then((user) => {
    let message;

    if (user) {
      if (!user.password) {
        message = config.messages.login.notLocal;
      } else if (!user.dateEmailVerified) {
        message = config.messages.login.emailNotVerified;
      } else if (user.dateBlocked) {
        message = config.messages.login.blocked;
      } else if (user.dateBanned) {
        message = config.messages.login.banned;
      } else {
        return authenticate(password, user.password).then(() => done(null, user));
      }
    } else {
      message = config.messages.login.noUserFound;
    }

    done(null, null, message);
  }).catch(done);
}

passport.use('local', new LocalStrategy(config.passport.local, localCallback));
