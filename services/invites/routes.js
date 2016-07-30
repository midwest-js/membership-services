'use strict';

const mw = require('./middleware');

const isAuthenticated = require('../../passport/authorization-middleware').isAuthenticated;

module.exports = [
	[ '/api/invites/', 'get', [ isAuthenticated, mw.formatQuery, mw.paginate, mw.find ]],
	[ '/api/invites/', 'post', [ isAuthenticated, mw.create ]],
	[ '/api/invites/:id', 'delete', [ isAuthenticated, mw.remove ]],
];
