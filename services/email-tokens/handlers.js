'use strict';

const p = require('path');

const config = require('../../config');

const { generateToken } = require('../users/helpers');

function create(json, client = config.db) {
  const token = generateToken();

  return client.query('INSERT INTO email_tokens (user_id, email, token) VALUES ($1, $2, $3) RETURNING token;',
      [json.userId, json.email, token]).then((result) => {
        return result.rows[0].token;
      });
}

module.exports = {
  create,
};
