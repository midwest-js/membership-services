'use strict';

const p = require('path');

const db = require(p.join(PWD, 'server/db'));

const { generateToken } = require('../users/helpers');

function create(json, cb, client) {
  const token = generateToken();

  (client || db).query('INSERT INTO email_tokens (user_id, email, token) VALUES ($1, $2, $3) RETURNING token;',
      [json.userId, json.email, token], cb);
}

module.exports = {
  create,
};
