'use strict';

const factory = require('midwest/factories/rest');
const formatQuery = require('midwest/factories/format-query');
const paginate = require('midwest/factories/paginate');

const handlers = require('./handlers');

module.exports = Object.assign(factory('roles', null, handlers), {
  formatQuery: formatQuery(['limit', 'sort', 'page']),
  paginate: paginate(handlers.count, 20),
});
