'use strict';

const factory = require('midwest/factories/rest');
const formatQuery = require('midwest/factories/format-query');
const paginate = require('midwest/factories/paginate');

const handlers = require('./handlers');

function getActive(req, res, next) {
  handlers.find({ active: true }, (err, invites) => {
    if (err) return next(err);

    res.locals.invites = invites;

    next();
  });
}

function getByQuery(req, res, next) {
  if (!req.find.token) {
    return next();
  }

  handlers.findById(req.find.token, (err, invite) => {
    if (err) {
      return next(err);
    }

    if (!invite || invite.email !== req.find.email || invite.dateConsumed) {
      return next();
    }

    res.status(200).locals.invite = invite;

    next();
  });
}

module.exports = Object.assign(factory('invites', null, handlers), {
  getActive,
  getByQuery,
  formatQuery: formatQuery(['limit', 'sort', 'page']),
  paginate: paginate(handlers.count, 20),
});
