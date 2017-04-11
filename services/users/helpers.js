'use strict';

const crypto = require('crypto');
const scrypt = require('scrypt-for-humans');

const config = require('../../config');

const queries = require('./sql');

function generateToken(length = config.tokenLength) {
  return crypto.randomBytes(length / 2).toString('hex');
}

function generatePasswordToken(email, length) {
  return {
    date: Date.now(),
    token: generateToken(length),
  };
}

function generateEmailToken(email, length) {
  return {
    email,
    token: generateToken(length),
    date: Date.now(),
  };
}

function hashPassword(password) {
  return scrypt.hash(password, {});
}

function authenticate(password, hash) {
  return scrypt.verifyHash(password, hash);
}

function login(user, client = config.db) {
  return client.query(queries.login, [user.email]);
}

module.exports = {
  authenticate,
  generateEmailToken,
  generatePasswordToken,
  generateToken,
  hashPassword,
  login,
};
