'use strict'

const rest = require('midwest/middleware/rest')
const formatQuery = require('midwest/middleware/format-query')
const paginate = require('midwest/middleware/paginate')

const Permission = require('./model')

module.exports = Object.assign(rest(Permission), {
  formatQuery: formatQuery([ 'limit', 'sort', 'page' ]),
  paginate: paginate(Permission, 20),
})
