'use strict';

// modules > native
const url = require('url');

// modules > 3rd party
const _ = require('lodash');

const formatQuery = require('midwest/factories/format-query');
const paginate = require('midwest/factories/paginate');
const factory = require('midwest/factories/rest-middleware');
const createError = require('midwest/util/create-error');
const resolveCache = require('../resolve-cache');

module.exports = _.memoize((state) => {
  const config = state.config;
  const providers = config.providers || [];

  const handlers = {
    emailTokens: require('../email-tokens/handlers')(state),
    invites: require('../invites/handlers')(state),
    admissions: require('../admissions/handlers')(state),
    roles: require('../roles/handlers')(state),
    users: require('./handlers')(state),
  };

  const { hashPassword } = require('./helpers')(state);

  function create(req, res, next) {
    handlers.users.create(req.body, (err, user) => {
      if (err) {
        if (req.body.password) {
          req.body.password = 'DELETED';
        }

        if (req.body.confirmPassword) {
          req.body.confirmPassword = 'DELETED';
        }

        return next(err);
      }

      /* HTTP specification says Location header shoult be included when creating
       * a new entity with POST
       */
      res.set('Location', `${req.url}/${user._id}`)
        .status(201)
        .locals.user = _.omit(user.toJSON(), 'local');

      next();
    });
  }

  function getRoles(req, email) {
    return handlers.invites.findByEmail(email).then((invite) => {
      let roles = invite ? invite.roles : [];

      return handlers.admissions.findMatches(email).then((admissions) => {
        if (admissions) {
          roles = _.union(roles, ...admissions.map((admission) => admission.roles));
        }

        return { invite, roles };
      });
    });
  }

  function resetPasswordWithToken(req, res, next) {
    // hide password in body
    function sendError(err) {
      if (req.body.password) {
        req.body.password = 'DELETED';
      }

      if (req.body.confirmPassword) {
        req.body.confirmPassword = 'DELETED';
      }

      next(err);
    }

    // if (!req.body.email || !req.body.password || !req.body.token) {
    if (!req.body.password) {
      const err = new Error('Not enough parameters');
      err.status = 422;
      return sendError(err);
    }

    // handlers.users.findOne({ email: req.body.email, 'passwordToken.token': req.body.token }, (err, user) => {
    handlers.users.findOne({ email: req.body.email }, (err, user) => {
      if (err) return next(err);

      if (!user) {
        return sendError(Object.assign(new Error('Incorrect token and/or email'), {
          status: 404,
        }));
      }


      // if (Date.now() > user.passwordToken.date + config.timeouts.changePassword) {
      //   return sendError(Object.assign(new Error('Token expired'), {
      //     status: 410,
      //   }));
      // }

      hashPassword(req.body.password, (err, hash) => {
        if (err) return sendError(err);

        handlers.users.updatePassword(user.id, hash, (err) => {
          if (err) return sendError(err);

          res.sendStatus(204);
        });
      });
    });
  }

  // middleware that checks if an email and token are valid
  function checkPasswordToken(req, res, next) {
    handlers.users.findOne({ email: req.find.email, 'passwordToken.token': req.find.token }, (err, user) => {
      if (err) return next(err);

      if (!user) {
        err = new Error('Token not found.');
        err.status = 404;
        return next(err);
      }

      if (user.passwordToken.date.getTime() + (24 * 60 * 60 * 1000) < Date.now()) {
        err = new Error('Token has expired.');
        err.status = 410;
        return next(err);
      }

      next();
    });
  }

  function exists(property) {
    return (req, res, next) => {
      // TODO maybe return true?
      if (!req.find[property]) {
        return res.json(false);
      }

      const query = {
        [property]: req.find[property],
      };

      handlers.users.count(query, (err, count) => {
        if (err) return next(err);

        // return true if user is found
        return res.json(count > 0);
      });
    };
  }

  function getCurrent(req, res, next) {
    res.locals.user = req.user && _.omit(req.user.toJSON(), ['local', 'facebook']);

    next();
  }

  function register(req, res, next) {
    // if (!req.body.email) {
    //   if (req.body.facebook && req.body.facebook.email) {
    //     req.body.email = req.body.facebook.email;
    //   } else {
    //     const err = new Error(config.errors.register.missingProperties);
    //     err.status = 422;
    //     return generateError(err);
    //   }
    // }

    let promise = handlers.users.count({ email: req.body.email }).then((count) => {
      if (count) throw createError(...config.errors.register.duplicateEmail);

      // req.body.email = req.body.email.toLowerCase();

      // const newUser = _.cloneDeep(req.body);

      return getRoles(req, req.body.email);
    }).then(({ roles, invite }) => {
      if (!roles) throw createError(...config.errors.register.notAuthorized);

      const newUser = _.merge({}, req.body, { roles });

      // TEMP
      if (invite) newUser.emailVerifiedAt = new Date();

      return handlers.users.create(newUser).then((user) => {
        if (invite) return handlers.invites.consume(invite.id).then(() => user);

        return user;
      });
    });

    if (config.hooks && config.hooks.register) {
      promise = promise.then(config.hooks.register);
    }

    promise.then((user) => {
      if (req.accepts(['json', '*/*'] === 'json')) {
        return res.status(201).json(_.omit(user, 'password', ...providers));
      }

      res.redirect(config.redirects.register);
    }).catch((err) => {
      if (req.body.password) {
        req.body.password = 'DELETED';
      }

      if (req.body.confirmPassword) {
        req.body.confirmPassword = 'DELETED';
      }

      next(err);
    });
  }

  function verifyEmail(req, res, next) {
    handlers.users.findOne({ email: req.find.email, 'emailToken.token': req.find.token }).then((user) => {
      // if (!user) {
      //   err = new Error('Incorrect token and/or email.');
      //   err.status = 404;
      //   return next(err);
      // }

      // if (Date.now() > user.emailToken.date + config.timeouts.verifyEmail) {
      //   err = new Error('Token has expired.');
      //   err.status = 410;
      //   return next(err);
      // }

      user.isEmailVerified = true;

      if (user.emailToken.email) {
        user.email = user.emailToken.email;
      }

      user.emailToken = undefined;

      const promise = handlers.update();

      if (config.hooks && config.hooks.verifyEmail) {
        return promise.then(config.hooks.verifyEmail);
      } else {
        return promise;
      }
    }).catch(next);
  }

  return Object.assign(factory({
    plural: 'users',
    handlers: handlers.users,
  }), {
    resetPasswordWithToken,
    checkPasswordToken,
    create,
    exists,
    formatQuery: formatQuery(['limit', 'sort', 'page', 'isBanned', 'isBlocked', 'isMuted', 'isVerified', 'isEmailVerified'], {
      username: 'regex',
      givenName: 'regex',
      familyName: 'regex',
    }),
    getCurrent,
    paginate: paginate(handlers.users.count, 20),
    register,
    verifyEmail,
  });
}, resolveCache);
