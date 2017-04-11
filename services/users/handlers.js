'use strict';

const _ = require('lodash');

const factory = require('midwest/factories/handlers');
const { one, many } = require('midwest/pg/result');
const sql = require('midwest/pg/sql-helpers');

const config = require('../../config');

const queries = require('./sql');

const columns = ['id', 'email', 'dateCreated', 'dateBanned', 'dateBlocked', 'dateEmailVerified'];


if (config.userColumns) {
  columns.push(...config.userColumns);
}

const columnsString = sql.columns(columns);

const handlers = {
  users: factory({
    columns,
    db: config.db,
    exclude: ['create', 'replace', 'update'],
    table: 'users',
  }),
  roles: require('../roles/handlers'),
  emailTokens: require('../email-tokens/handlers'),
};

const { hashPassword } = require('./helpers');

function addRoles(userId, roles, client = config.db) {
  return client.query(queries.addRoles, [userId, roles]).then(many);
}

function create(json, client = config.db) {
  const roleIds = typeof json.roles[0] === 'object' ? json.roles.map((role) => role.id) : json.roles;

  return hashPassword(json.password).then((hash) => {
    return client.begin().then((t) => {
      return t.query(queries.create, [json.givenName, json.familyName, json.email, hash, json.dateEmailVerified])
        .then((result) => {
          const user = result.rows[0];

          return Promise.all([
            addRoles(user.id, roleIds, t),
            handlers.emailTokens.create({ userId: user.id, email: user.email }, t),
            handlers.roles.findByIds(roleIds),
          ])
            .then((result) => t.commit().then(() => result))
            .then(([, token, roles]) => {
              user.roles = roles;
              user.emailToken = token;
              return user;
            });
        });
    });
  });
}

function findByEmail(email, client = config.db) {
  return client.query(queries.findByEmail, [email]).then(one);
}

function getAuthenticationDetails(email, client = config.db) {
  return client.query(queries.getAuthenticationDetails, [email]).then((result) => {
    if (!result.rows.length) throw new Error('No user found');

    return result.rows[0];
  });
}

function replace(id, json, cb) {
  cb();
}

function update(id, json, client = config.db) {
  return client.begin().then((t) => {
    let roles = json.roles;

    json = _.pickBy(json, (value, key) => key !== 'roles' && columns.includes(key));

    const keys = _.keys(json).map((key) => `"${_.snakeCase(key)}"`);

    if (!keys.length && !roles) return Promise.reject(new Error('No allowed parameters received'));

    const values = _.values(json);

    const query = `UPDATE users SET ${keys.map((key, i) => `${key}=$${i + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING ${columnsString};`;

    return t.query(query, [...values, id]).then(() => {
      if (roles && roles.length) {
        if (typeof roles[0] === 'object') roles = roles.map((role) => role.id);

        return t.query(queries.updateRolesQuery, [id, roles]);
      }
    }).then(t.commit).then(() => handlers.users.findById(id));
  });
}

function updatePassword(id, password, client = config.db) {
  if (!password) return Promise.reject(new Error('Password required'));

  const query = 'UPDATE users SET password=$2 WHERE id = $1 RETURNING id;';

  // TODO maybe throw error if not updated properly
  return client.query(query, [id, password]).then((result) => !!result.rows[0].id);
}

function updateRoles() {

}

module.exports = Object.assign(handlers.users, {
  addRoles,
  create,
  findByEmail,
  getAuthenticationDetails,
  replace,
  update,
  updatePassword,
  updateRoles,
});
