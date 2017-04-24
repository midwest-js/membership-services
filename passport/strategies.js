'use strict';

// modules > native
const p = require('path');

// modules > passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const createError = require('midwest/util/create-error');

const config = require(p.join(process.cwd(), 'server/config/membership'));

const { getAuthenticationDetails } = require('../services/users/handlers');
const { authenticate } = require('../services/users/helpers');

function localCallback(email, password, done) {
  getAuthenticationDetails(email.toLowerCase()).then((user) => {
    let error;

    if (user) {
      if (!user.password) {
        error = config.errors.login.notLocal;
      } else if (!user.dateEmailVerified) {
        error = config.errors.login.emailNotVerified;
      } else if (user.dateBlocked) {
        error = config.errors.login.blocked;
      } else if (user.dateBanned) {
        error = config.errors.login.banned;
      } else {
        return authenticate(password, user.password).then(() => done(null, user));
      }
    } else {
      error = config.errors.login.noUserFound;
    }

    done(createError(...error));
  }).catch(done);
}

passport.use('local', new LocalStrategy(config.passport.local, localCallback));
