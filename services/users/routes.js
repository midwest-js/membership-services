'use strict'

const mw = require('./middleware')

const isAuthenticated = require('../../passport/authorization-middleware').isAuthenticated

module.exports = [
  [ '/api/users/', 'get', isAuthenticated, mw.formatQuery, mw.query ],
  [ '/api/users/', 'post', isAuthenticated, mw.create ],
  [ '/api/users/me', 'get', mw.getCurrent ],
  [ '/api/users/:id', 'delete', isAuthenticated, mw.remove],
  [ '/api/users/:id', 'get', isAuthenticated, mw.findOne ],
  [ '/api/users/:id', 'patch', isAuthenticated, mw.update ],
  [ '/api/users/:id', 'put', isAuthenticated, mw.update ],
  [ '/api/users/reset-password', 'post', mw.resetPassword ],
  [ '/api/users/update-password', 'post', mw.updatePassword ]
]
