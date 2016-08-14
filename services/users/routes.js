'use strict'

const mw = require('./middleware')

const isAuthenticated = require('../../passport/authorization-middleware').isAuthenticated

module.exports = [
	[ '/api/users/', 'get', [ isAuthenticated, mw.query ] ],
	[ '/api/users/', 'post', [ mw.register ]],
	[ '/api/users/:id', 'delete', [ isAuthenticated, mw.remove ]],
	[ '/api/users/:id', 'get', [ isAuthenticated, mw.findOne ] ],
	[ '/api/users/:id', 'patch', [ isAuthenticated, mw.update ] ],
	[ '/api/users/:id', 'put', [ isAuthenticated, mw.update ] ],
	[ '/api/users/reset-password', 'post', [ mw.resetPassword ] ],
	[ '/api/users/update-password', 'post', [ mw.updatePassword ] ],
]
