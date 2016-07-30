'use strict';

const passport = require('passport');
const redirect = require('warepot/redirect');

require('./setup');
//const passportMiddleware = require('./middleware');
const config = require('../config').membership;

function _401(str) {
  const err = new Error(str ? str.message || str : 'No message');
  err.status = 401;
  return err;
}

function local(req, res, next) {
  return function (err, user, message) {
    // message will only be set if passport strategy has encountered login
    // error (not a coding error).
    if (message)
      err = _401(message);

    if (err)
      return next(err);

    if (req.body.remember) {
      if (config.remember.expires)
        req.session.cookie.expires = config.remember.expires;
      else
        req.session.cookie.maxAge = config.remember && config.remember.maxAge;
    }


    req.login(user, function (err) {
      if (err) return next(err);

      user = user.toObject();
      delete user.local;

      res.status(200);

      res.format({
        html: function () {
          res.redirect(req.session.lastPath || '/');
        },
        json: function () {
          if (req.session.lastPath) res.set('Location', req.session.lastPath);

          res.json(user);
        }
      });
    });
  };
}

const mw = {
  local: function (req, res, next) {
    passport.authenticate('local', local(req, res, next))(req, res, next);
  },

  logout: function (req, res, next) {
    req.logout();
    res.status(200);
    res.locals.ok = true;
    next();
  }
};

const routes = [
  [ '/auth/local', 'post', [ mw.local ]],
  [ '/auth/logout', 'get', [ mw.logout, redirect('/') ]],
  //[ '/auth/local', 'post', [ passportMiddleware.initialize, passportMiddleware.session, mw.local ]],
  //[ '/auth/logout', 'get', [ passportMiddleware.initialize, passportMiddleware.session, mw.logout, redirect('/') ]],
];

module.exports = routes;
