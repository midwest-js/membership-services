'use strict';

const rest = require('midwest/factories/rest');
const formatQuery = require('midwest/factories/format-query');
const paginate = require('midwest/factories/paginate');

const Role = require('./model');

module.exports = Object.assign(rest(Role), {
  formatQuery: formatQuery(['limit', 'sort', 'page']),
  paginate: paginate(Role, 20),
});
