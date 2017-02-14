'use strict';

const factory = require('midwest/factories/rest');
const formatQuery = require('midwest/factories/format-query');
const paginate = require('midwest/factories/paginate');

const handlers = require('./handlers');

const mw = factory({
  plural: 'roles',
  handlers,
});

module.exports = Object.assign({}, mw, {
  create(req, res, next) {
    Object.assign(req.body, {
      createdById: req.user.id,
    });

    mw.create(req, res, next);
  },
  formatQuery: formatQuery(['limit', 'sort', 'page']),
  paginate: paginate(handlers.count, 20),
});
