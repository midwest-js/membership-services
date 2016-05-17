'use strict';

const mw = require('./permissions-middleware');

const isAuthenticated = require('../../passport/authorization-middleware').isAuthenticated;

module.exports = [
  [ '/api/permissions/', 'get', [ isAuthenticated, mw.formatQuery, mw.paginate, mw.find ]],
  [ '/api/permissions/', 'post', [ isAuthenticated, mw.create ]],
  [ '/api/permissions/:id', 'get', [ isAuthenticated, mw.findById ]],
  [ '/api/permissions/:id', 'delete', [ isAuthenticated, mw.remove ]],
  [ '/api/permissions/:id', 'put', [ isAuthenticated, mw.put ]]
];
