'use strict'

const _ = require('lodash')

const factory = require('@bmp/pg/handlers')
const { one, many } = require('@bmp/pg/result')
const sql = require('@bmp/pg/sql-helpers')
const resolver = require('deep-equal-resolver')()
const Promise = require('bluebird')

const queries = require('./sql')

const defaultColumns = [
  'bannedAt',
  'bannedById',
  'blockedAt',
  'blockedById',
  'createdAt',
  'email',
  'emailVerifiedAt',
  'id',
  'lastActivityAt',
  'lastLoginAt',
  'loginAttempts',
]

module.exports = _.memoize((state) => {
  const customColumns = _.get(state, 'config.services.users.columns') || _.get(state, 'config.userColumns')

  const columns = customColumns ? defaultColumns.concat(customColumns) : defaultColumns
  const columnsString = sql.columns(columns)

  const handlers = {
    users: factory({
      columns,
      db: state.db,
      emitter: state.emitter,
      exclude: ['create', 'replace', 'update'],
      table: 'users',
    }),
    roles: require('../roles/handlers')(state),
  }

  function addRoles (userId, roles, client = state.db) {
    if (!roles || roles.length === 0) {
      return Promise.resolve([])
    } else if (!Array.isArray(roles)) {
      roles = [roles]
    }

    let promise

    if (typeof roles[0] === 'string') {
      promise = handlers.roles.findByNames(roles)
    } else if (typeof roles[0] === 'number') {
      promise = handlers.roles.findByIds(roles)
    } else {
      promise = Promise.resolve(roles)
    }

    return promise.then((roles) => {
      roles = roles.map((role) => role.id)

      return client.query(queries.addRoles, [userId, roles]).then(many)
    })
  }

  function __create (json, t) {
    return t.query(queries.create, [json.givenName, json.familyName, json.email, json.password, json.emailVerifiedAt])
      .then((result) => {
        const user = result.rows[0]

        return addRoles(user.id, json.roles, t)
          .then((roles) => {
            user.roles = roles
            return user
          })
      })
  }

  function create (json, client = state.db) {
    if (typeof client.commit === 'function') {
      return __create(json, client)
    } else {
      return client.begin()
        .then((t) => {
          return __create(json, t)
            .then((result) => {
              return t.commit().then(() => result)
            })
        })
    }
  }

  function findByEmail (email, client = state.db) {
    return client.query(queries.findByEmail, [email]).then(one)
  }

  function onActivity (id, client = state.db) {
    return update(id, { lastActivityAt: 'now()' })
  }

  function onLogin (id, client = state.db) {
    return update(id, { lastLoginAt: 'now()', loginAttempts: 0 })
  }

  function replace (id, json, client = state.db) {
    return update(id, json, client)
  }

  function update (id, json, client = state.db) {
    return client.begin().then((t) => {
      let roles = json.roles

      json = _.pickBy(json, (value, key) => key !== 'roles' && columns.includes(key))

      const keys = _.keys(json).map((key) => `"${_.snakeCase(key)}"`)

      if (!keys.length && !roles) return Promise.reject(new Error('No allowed parameters received'))

      const values = _.values(json)

      const query = `UPDATE users SET ${keys.map((key, i) => `${key}=$${i + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING ${columnsString};`

      return t.query(query, [...values, id]).then(() => {
        if (roles && roles.length) {
          if (typeof roles[0] === 'object') roles = roles.map((role) => role.id)

          return t.query(queries.updateRolesQuery, [id, roles])
        }
      }).then(t.commit).then(() => handlers.users.findById(id))
    })
  }

  return Object.assign(handlers.users, {
    addRoles,
    create,
    findByEmail,
    onActivity,
    onLogin,
    replace,
    update,
  })
}, resolver)
