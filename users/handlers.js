'use strict'

const _ = require('lodash')

const factory = require('midwest/factories/rest-handlers')
const { one, many } = require('easy-postgres/result')
const sql = require('easy-postgres/sql-helpers')

const queries = require('./sql')
const resolveCache = require('../resolve-cache')

const columns = [
  'bannedAt',
  'blockedAt',
  'createdAt',
  'email',
  'emailVerifiedAt',
  'familyName',
  'givenName',
  'id'
]

module.exports = _.memoize((state) => {
  if (state.config && state.config.userColumns) {
    columns.push(...state.config.userColumns)
  }

  const columnsString = sql.columns(columns)

  const handlers = {
    users: factory({
      columns,
      db: state.db,
      emitter: state.emitter,
      exclude: ['create', 'replace', 'update'],
      table: 'users'
    }),
    roles: require('../roles/handlers')(state),
    emailTokens: require('../email-tokens/handlers')(state)
  }

  const { hashPassword } = require('./helpers')(state)

  function addRoles (userId, roles, client = state.db) {
    return client.query(queries.addRoles, [userId, roles]).then(many)
  }

  function create (json, client = state.db) {
    if (!json.roles) json.roles = []
    else if (!Array.isArray(json.roles)) json.roles = [json.roles]

    let rolesPromise

    if (typeof json.roles[0] === 'string') rolesPromise = handlers.roles.findByNames(json.roles)
    else if (typeof json.roles[0] === 'number') rolesPromise = handlers.roles.findByIds(json.roles)
    else rolesPromise = Promise.resolve(json.roles)

    return Promise.all([
      rolesPromise,
      hashPassword(json.password)
    ]).then(([roles, hash]) => {
      return client.begin().then((t) => {
        return t.query(queries.create, [json.givenName, json.familyName, json.email, hash, json.emailVerifiedAt])
          .then((result) => {
            const roleIds = roles.map((role) => role.id)

            const user = result.rows[0]

            return Promise.all([
              addRoles(user.id, roleIds, t),
              handlers.emailTokens.create({ userId: user.id, email: user.email }, t),
              handlers.roles.findByIds(roleIds)
            ])
              .then((result) => t.commit().then(() => result))
              .then(([, token, roles]) => {
                user.roles = roles
                user.emailToken = token
                return user
              })
          })
      })
    })
  }

  /* should be used to deserialize a user into a session
   * given a user id */
  function deserialize (id, client = state.db) {
    return client.query(queries.deserialize, [id]).then(one)
  }

  function findByEmail (email, client = state.db) {
    return client.query(queries.findByEmail, [email]).then(one)
  }

  /* should get all details required to authenticate a login request,
   * ie password hash, if the user is blocked or banned etc. */
  function getAuthenticationDetails (email, client = state.db) {
    return client.query(queries.getAuthenticationDetails, [email]).then((result) => {
      if (!result.rows.length) throw new Error('No user found')

      return result.rows[0]
    })
  }

  function getPermissions (id, client = state.db) {
    return client.query(queries.getPermissions, [id]).then(many)
  }

  /* should be called on successful login, should be doing stuff like
   * setting last login date, reset unsuccessful login count etc */
  function login (user, client = state.db) {
    return client.query(queries.login, [user.email])
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

  function updatePassword (id, password, client = state.db) {
    if (!password) return Promise.reject(new Error('Password required'))

    const query = 'UPDATE users SET password=$2 WHERE id = $1 RETURNING id;'

    // TODO maybe throw error if not updated properly
    return client.query(query, [id, password]).then((result) => !!result.rows[0].id)
  }

  function updateRoles () {

  }

  return Object.assign(handlers.users, {
    addRoles,
    create,
    deserialize,
    findByEmail,
    getAuthenticationDetails,
    getPermissions,
    login,
    replace,
    update,
    updatePassword,
    updateRoles
  })
}, resolveCache)
