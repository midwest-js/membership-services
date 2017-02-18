'use strict';

function returnError(req, res, next) {
  const err = new Error('Unauthorized request');
  err.status = 401;
  next(err);
}

const isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    return returnError(req, res, next);
  }
};

const redirectAuthenticated = function (url) {
  return function redirectAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect(url);
    } else {
      next();
    }
  };
};

const redirectUnauthorized = function (url) {
  return function redirectUnauthorized(error, req, res, next) {
    if (error.status === 401 && !req.user && !req.xhr && req.accepts('html', 'json') === 'html') {
      req.session.previousUrl = req.originalUrl;
      res.redirect(url);
    } else {
      next(error);
    }
  };
};

const redirectAuthorized = function (authorizationMiddleware, url) {
  return function redirectAuthorized(req, res, next) {
    authorizationMiddleware(req, res, (err) => {
      if (!err) return res.redirect(url);

      next();
    });
  };
};


const isCurrent = function (req, res, next) {
  if (req.user && req.params.id === req.user._id.toString()) {
    next();
  } else {
    return returnError(req, res, next);
  }
};

const hasRole = function (role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user.roles.includes(role)) {
      return next();
    }
    return returnError(req, res, next);
  };
};

const isAdmin = hasRole('admin');

module.exports = {
  isAuthenticated,
  isCurrent,
  redirectAuthenticated,
  redirectUnauthorized,
  redirectAuthorized,
  hasRole,
  isAdmin,
};
