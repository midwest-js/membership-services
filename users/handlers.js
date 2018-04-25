'use strict'

const _ = require('lodash')

const factory = require('@bmp/pg/handlers')
const { one, many } = require('@bmp/pg/result')
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
  'password',
]

module.exports = _.memoize((state) => {
  const customColumns = _.get(state, 'config.services.users.columns') || _.get(state, 'config.userColumns')

  const columns = customColumns ? defaultColumns.concat(customColumns) : defaultColumns

  const handlers = {
    users: factory({
      columns,
      db: state.db,
      emitter: state.emitter,
      exclude: ['replace'],
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
      roles = roles.map((role) => role.id || role)

      return client.query(queries.addRoles, [userId, roles]).then(many)
    })
  }

  function __create (json, t) {
    return handlers.users.create(json)
      .then((user) => {
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
      return handlers.users.update(id, _.omit(json, [ 'roles' ]), t).then((result) => {
        let roles = json.roles

        if (roles && roles.length) {
          if (typeof roles[0] === 'object') roles = roles.map((role) => role.id)

          return t.query(queries.updateRolesQuery, [id, roles])
        }
      }).then(t.commit).then(() => handlers.users.findById(id))
    })
  }

  return Object.assign({}, handlers.users, {
    addRoles,
    create,
    findByEmail,
    onActivity,
    onLogin,
    replace,
    update,
  })
}, resolver)
