'use strict';

const factory = require('midwest/factories/rest');
const formatQuery = require('midwest/factories/format-query');
const paginate = require('midwest/factories/paginate');

const handlers = require('./handlers');

const mw = factory('invites', null, handlers);

function create(req, res, next) {
  Object.assign(req.body, {
    createdByEmail: req.user.email,
    createdById: req.user.id,
  });

  mw.create(req, res, next);
}

function getActive(req, res, next) {
  handlers.find({ active: true }, (err, invites) => {
    if (err) return next(err);

    res.locals.invites = invites;

    next();
  });
}

function findByTokenAndEmail(req, res, next) {
  if (!req.query.token) {
    return next();
  }

  handlers.findByTokenAndEmail(req.query.token, req.query.email, (err, invite) => {
    if (!invite) {
      return next(new Error('No invite found'));
    }

    if (invite.dateConsumed) {
      return next(new Error('Invite already consumed'));
    }

    res.status(200).locals.invite = invite;

    next();
  });
}

module.exports = Object.assign({}, mw, {
  create,
  getActive,
  findByTokenAndEmail,
  formatQuery: formatQuery(['limit', 'sort', 'page']),
  paginate: paginate(handlers.count, 20),
});
