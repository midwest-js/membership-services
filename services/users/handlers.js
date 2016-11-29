'use strict';

const p = require('path');

const _ = require('lodash');

const factory = require('midwest/factories/handlers');

const db = require(p.join(PWD, 'server/db'));

const queries = require('./queries');

const columns = ['id', 'email', 'dateCreated'];

const handlers = {
  users: factory('users', columns, ['create']),
  emailTokens: require('../email-tokens/handlers'),
};

const { hashPassword } = require('./helpers');

function create(json, cb) {
  console.log(json);
  if (!json.dateEmailVerified) {
    db.connect((err, client, done) => {
      db.query('BEGIN;', (err) => {
        if (err) {
          db.rollback(client, done);
          return cb(err);
        }

        db.query(queries.create, [json.givenName, json.familyName, json.email, hashPassword(json.password), json.roles], (err, result) => {
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

            db.query('COMMIT;', (err) => {
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
});
