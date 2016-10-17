'use strict';

const rest = require('midwest/middleware/rest');
const formatQuery = require('midwest/middleware/format-query');
const paginate = require('midwest/middleware/paginate');

const Role = require('./model');

module.exports = Object.assign(rest(Role), {
  formatQuery: formatQuery(['limit', 'sort', 'page']),
  paginate: paginate(Role, 20),
});
