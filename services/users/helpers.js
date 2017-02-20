'use strict';

const p = require('path');
const crypto = require('crypto');
const scrypt = require('scrypt-for-humans');

const db = require(p.join(process.cwd(), 'server/db'));

const config = {
  membership: require(p.join(process.cwd(), 'server/config/membership')),
  postgres: require(p.join(PWD, 'server/config/postgres')),
};

const queries = require('./queries');

const { tokenLength } = config.membership;

function generateToken(length = tokenLength) {
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

function hashPassword(password, cb) {
  scrypt.hash(password, {}, cb);
}

function authenticate(password, hash, cb) {
  scrypt.verifyHash(password, hash, cb);
}

function login(user) {
  db.query(queries.login, [user.email], (err) => {
    if (err) console.error(err);
  });
}

module.exports = {
  authenticate,
  generateEmailToken,
  generatePasswordToken,
  generateToken,
  hashPassword,
  login,
};
