'use strict'

const rest = require('warepot/rest')
const formatQuery = require('warepot/format-query')
const paginate = require('warepot/paginate')

const Role = require('./model')

module.exports = Object.assign(rest(Role), {
  formatQuery: formatQuery([ 'limit', 'sort', 'page' ]),
  paginate: paginate(Role, 20),
})
