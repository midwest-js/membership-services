'use strict'

const _ = require('lodash')
const factory = require('midwest/factories/rest-handlers')
const { many } = require('easy-postgres/result')

const queries = require('./sql')
// modules > project
const resolveCache = require('../resolve-cache')

const columns = ['id', 'name', 'createdAt', 'createdById', 'modifiedById', 'modifiedAt']

module.exports = _.memoize((state) => {
  function findByIds (ids, client = state.db) {
    return client.query(queries.findByIds, [ids]).then(many)
  }

  function findByNames (names, client = state.db) {
    return client.query(queries.findByNames, [names]).then(many)
  }

  return Object.assign(factory({
    emitter: state.emitter,
    db: state.db,
    table: 'roles',
    columns
  }), { findByIds, findByNames })
}, resolveCache)
