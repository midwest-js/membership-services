'use strict'

const rest = require('warepot/rest')
const formatQuery = require('warepot/format-query')
const paginate = require('warepot/paginate')

const Permission = require('./model')

module.exports = Object.assign(rest(Permission), {
  formatQuery: formatQuery([ 'limit', 'sort', 'page' ]),
  paginate: paginate(Permission, 20),
})
