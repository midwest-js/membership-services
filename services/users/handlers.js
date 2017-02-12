'use strict';

const p = require('path');

const _ = require('lodash');

const factory = require('midwest/factories/handlers');
const { columns: sqlColumns, where } = require('midwest/util/sql');

const db = require(p.join(process.cwd(), 'server/db'));
const config = require(p.join(process.cwd(), 'server/config/membership'));

const queries = require('./queries');

const columns = ['id', 'email', 'dateCreated'];


if (config.userColumns) {
  columns.push(...config.userColumns);
}

const handlers = {
  users: factory({
    table: 'users',
    columns: columns,
    exclude: ['create', 'replace', 'update'],
  }),
  emailTokens: require('../email-tokens/handlers'),
};

const { hashPassword } = require('./helpers');

function create(json, cb) {
  if (!json.dateEmailVerified) {
    db.connect((err, client, done) => {
      client.query('BEGIN;', (err) => {
        if (err) {
          db.rollback(client, done);
          return cb(err);
        }

        client.query(queries.create, [json.givenName, json.familyName, json.email, hashPassword(json.password), json.roles], (err, result) => {
          if (err) {
            db.rollback(client, done);
            return cb(err);
          }

          const userId = result.rows[0].id;

          handlers.emailTokens.create(Object.assign({ userId }, _.pick(json, 'email')), (err, result) => {
            if (err) {
              db.rollback(client, done);
              return cb(err);
            }

            client.query('COMMIT;', (err) => {
              if (err) {
                db.rollback(client, done);
                return cb(err);
              }

              cb(null, {
                userId,
                token: result.rows[0].token,
              });
            });
          });
        }, client);
      });
    });
  } else {
    db.query(queries.create, [json.givenName, json.familyName, json.email, hashPassword(json.password), json.roles], (err, result) => {
      if (err) return cb(err);

      cb(null, result);
    });
  }
}

function replace(id, json, cb) {
  cb();
}

const updateRolesQuery = `
WITH deleted_rows AS (
  DELETE FROM user_roles
    WHERE user_id = $1 AND role_id NOT IN
      (SELECT role_ids FROM unnest($2::int[]) AS role_ids)
    RETURNING role_id
), inserted_rows AS (
  INSERT INTO user_roles(user_id, role_id)
     SELECT $1, role_ids FROM unnest($2::int[]) AS role_ids WHERE NOT EXISTS
      (SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = role_ids)
    RETURNING role_id, user_id
) 

SELECT role_id, user_id FROM inserted_rows;
`;

const columnsString = sqlColumns(columns);

function update(id, json, cb) {
  db.connect((err, client, done) => {
    client.query('BEGIN;', (err) => {
      if (err) {
        db.rollback(client, done);
        return cb(err);
      }

      let roles = json.roles;

      json = _.pickBy(json, (value, key) => key !== 'roles' && columns.includes(key));

      const keys = _.keys(json).map((key) => `"${_.snakeCase(key)}"`);
      const values = _.values(json);

      const query = `UPDATE users SET ${keys.map((key, i) => `${key}=$${i + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING ${columnsString};`;

      console.log(query);

      client.query(query, [...values, id], (err, result) => {
        if (err) {
          db.rollback(client, done);
          return cb(err);
        }

        if (roles && roles.length) {
          if (typeof roles[0] === 'object') roles = roles.map((role) => role.id);

          client.query(updateRolesQuery, [id, roles], (err, result) => {
            if (err) {
              db.rollback(client, done);
              return cb(err);
            }

            client.query('COMMIT;', (err) => {
              if (err) {
                db.rollback(client, done);
                return cb(err);
              }

              handlers.users.findById(id, cb);
            });
          });
        } else {
          client.query('COMMIT;', (err) => {
            if (err) {
              db.rollback(client, done);
              return cb(err);
            }

            cb(null, result.rows[0]);
          });
        }
      });
    });
  });
}

function findByEmail(email, cb) {
  db.query(queries.findByEmail, [email], (err, result) => {
    if (err) return cb(err);

    cb(null, result.rows[0]);
  });
}

function getAuthenticationDetails(email, cb) {
  db.query(queries.getAuthenticationDetails, [email], (err, result) => {
    if (err) return cb(err);

    cb(null, result.rows[0]);
  });
}

// function register(json, cb) {
//   handlers.create(_.omit(json, 'roles'), (err, ))

// }

module.exports = Object.assign(handlers.users, {
  create,
  findByEmail,
  getAuthenticationDetails,
  replace,
  update,
});
