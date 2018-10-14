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

// TODO
// implement option to choose whether to include the token or not

module.exports = _.memoize((state) => {
  function create (json, client = state.db) {
    const token = generateToken()

    const promise = client.query(queries.create, [json.email, token, json.createdById, json.roles]).then(one)

    const hook = _.get(state, 'config.invites.hooks.create')

    if (hook) {
      return promise
        .then(invite => hook(invite).then(() => invite))
    } else {
      return promise
    }
  }

  function find (json, client = state.db) {
    const limit = json.limit || null
    const offset = Math.max(0, json.offset)

    return client.query(queries.find, [ limit, offset ]).then(many)
  }

  function findById (id, client = state.db) {
    return client.query(queries.findById, [ id ]).then(one)
  }

  function findByEmail (email, client = state.db) {
    return client.query(queries.findByEmail, [ email ]).then(one)
  }

  function findByTokenAndEmail (token, email, client = state.db) {
    return client.query(queries.findByTokenAndEmail, [ token, email ]).then(one)
  }

  function getAll (client = state.db) {
    const limit = null
    const offset = 0

    return client.query(queries.getAll, [ limit, offset ]).then(many)
  }

  function consume (id, client = state.db) {
    return client.query(queries.consume, [id]).then((result) => {
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
