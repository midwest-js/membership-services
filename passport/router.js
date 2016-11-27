'use strict';

// modules > native
const p = require('path');

// modules > 3rd party
const passport = require('passport');
const redirect = require('midwest/factories/redirect');
const { register, sendChangePasswordLink, changePasswordWithToken } = require('../services/users/middleware');
const router = new (require('express')).Router();

require('./setup');

const config = require(p.join(process.cwd(), 'server/config/membership'));

function _401(str) {
  return Object.assign(new Error(str ? str.message || str : 'No message'), {
    status: 401,
  });
}

function local(req, res, next) {
  return (err, user, message) => {
    // message will only be set if passport strategy has encountered login
    // error (not a coding error).
    if (message) {
      err = _401(message);
    }

    if (err) {
      if (req.body.password) {
        req.body.password = 'DELETED';
      }

      if (req.body.confirmPassword) {
        req.body.confirmPassword = 'DELETED';
      }

      return next(err);
    }

    if (req.body.remember) {
      if (config.remember.expires) {
        req.session.cookie.expires = config.remember.expires;
      } else {
        req.session.cookie.maxAge = config.remember && config.remember.maxAge;
      }
    }


    req.login(user, (err) => {
      if (err) return next(err);

      delete user.password;

      res.status(200);

      res.format({
        html() {
          res.redirect(req.session.previousUrl || '/');
        },
        json() {
          if (req.session.previousUrl) res.set('Location', req.session.previousUrl);

          res.json(user);
        },
      });
    });
  };
}

const mw = {
  local: (req, res, next) => {
    passport.authenticate('local', local(req, res, next))(req, res, next);
  },

  logout: (req, res, next) => {
    req.logout();
    res.status(200);
    res.locals.ok = true;
    next();
  },
};

router
  .post('/local', mw.local)
  .get('/logout', mw.logout, redirect(config.redirects.logout))
  .post('/register', register)
  .post('/forgot-password', sendChangePasswordLink)
  .post('/change-password', changePasswordWithToken);

module.exports = router;
