'use strict'

// modules > native
const crypto = require('crypto')

// modules > 3rd party
const _ = require('lodash')

// modules > midwest
const factory = require('@bmp/pg/handlers')
const { one, many } = require('@bmp/pg/result')
const resolver = require('deep-equal-resolver')()
const queries = require('./sql')

const columns = [
  'id',
  'email',
  'createdAt',
  'createdById',
  'modifiedAt',
  'modifiedById',
  'consumedAt',
]

function generateToken (length = 64) {
  return crypto.randomBytes(length / 2).toString('hex')
}

module.exports = _.memoize((state) => {
  const config = state.config

  function create (json, client = state.db) {
    const token = generateToken()

    const promise = client.query(queries.create, [json.email, token, json.createdById, json.roles]).then(one)

    if (config.hooks && config.hooks.invite) {
      return promise.then(config.hooks.invite)
    } else {
      return promise
    }
  }

  function find (json, client = state.db) {
    const offset = Math.max(0, json.offset)

    return client.query(queries.find, [offset]).then(many)
  }

  function findById (id, client = state.db) {
    return client.query(queries.findById, [id]).then(one)
  }

  function findByEmail (email, client = state.db) {
    return client.query(queries.findByEmail, [email]).then(one)
  }

  function findByTokenAndEmail (token, email, client = state.db) {
    return client.query(queries.findByTokenAndEmail, [token, email]).then(one)
  }

  function getAll (client = state.db) {
    return client.query(queries.getAll).then(many)
  }

  function consume (id, client = state.db) {
    const query = 'UPDATE invites SET consumed_at = NOW() WHERE id = $1;'

    return client.query(query, [id]).then((result) => {
      if (result.rowCount === 0) throw new Error('Error consuming invite')
    })
  }

  return Object.assign(factory({
    emitter: state.emitter,
    db: state.db,
    table: 'invites',
    columns,
    exclude: ['create', 'getAll', 'find', 'findById'],
  }), {
    consume,
    create,
    find,
    findByEmail,
    findById,
    findByTokenAndEmail,
    getAll,
  })
}, resolver)
