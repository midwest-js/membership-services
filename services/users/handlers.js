'use strict';

const p = require('path');

const pg = require('pg');

const factory = require('midwest/factories/handlers');

const config = require(p.join(PWD, 'server/config/postgres'));

const queries = require('./queries');

const pool = new pg.Pool(config);

const handlers = factory('users', ['create'])

function findByEmail(email, cb) {
  pool.query(queries.findByEmail, [email], (err, result) => {
    if (err) return cb(err);

    cb(null, result.rows[0]);
  });
}

function getAuthenticationDetails(email, cb) {
  pool.query(queries.getAuthenticationDetails, [email], (err, result) => {
    if (err) return cb(err);

    cb(null, result.rows[0]);
  });
}

module.exports = {
  findByEmail,
  getAuthenticationDetails,
};
