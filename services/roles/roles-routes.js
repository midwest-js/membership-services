'use strict';

const mw = require('./roles-middleware');

const isAuthenticated = require('../../passport/authorization-middleware').isAuthenticated;

module.exports = [
  [ '/api/roles/', 'get', [ isAuthenticated, mw.formatQuery, mw.paginate, mw.find ]],
  [ '/api/roles/', 'post', [ isAuthenticated, mw.create ]],
  [ '/api/roles/:id', 'delete', [ isAuthenticated, mw.remove ]],
  [ '/api/roles/:id', 'get', [ isAuthenticated, mw.findById ]],
  [ '/api/roles/:id', 'put', [ isAuthenticated, mw.put ]],
];
