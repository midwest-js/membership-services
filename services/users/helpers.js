'use strict';

const p = require('path');
const crypto = require('crypto');

const pg = require('pg');

const config = {
  membership: require(p.join(process.cwd(), 'server/config/membership')),
  postgres: require(p.join(PWD, 'server/config/postgres')),
};

const queries = require('./queries');

const pool = new pg.Pool(config.postgres);

const { saltLength, tokenLength } = config.membership;

function generatePasswordToken() {
  return {
    date: Date.now(),
    token: crypto.randomBytes(tokenLength / 2).toString('hex'),
  };
}

function generateToken(email, length) {
  length = (length || tokenLength) / 2;

  return crypto.randomBytes(tokenLength / 2).toString('hex');
}

function generateEmailToken(email) {
  return {
    email,
    token: crypto.randomBytes(tokenLength / 2).toString('hex'),
    date: Date.now(),
  };
}

// mix salt and hashed password into a single string
function entangle(string, salt, t) {
  const arr = (salt + string).split('');
  const length = arr.length;

  for (let i = 0; i < salt.length; i++) {
    const num = ((i + 1) * t) % length;
    const tmp = arr[i];
    arr[i] = arr[num];
    arr[num] = tmp;
  }

  return arr.join('');
}

// extract salt and hashed password from entangled string
function detangle(string, t) {
  const arr = string.split('');
  const length = arr.length;

  for (let i = saltLength - 1; i >= 0; i--) {
    const num = ((i + 1) * t) % length;
    const tmp = arr[i];
    arr[i] = arr[num];
    arr[num] = tmp;
  }

  const str = arr.join('');

  return {
    salt: str.substring(0, saltLength),
    hash: str.substring(saltLength),
  };
}

function hashPassword(password) {
  password = password.trim();

  const salt = crypto.randomBytes(saltLength / 2).toString('hex');

  // hash the password
  const passwordHash = crypto.createHash('sha512').update(salt + password).digest('hex');

  // entangle the hashed password with the salt and save to the model
  return entangle(passwordHash, salt, password.length);
}

function authenticate(password, hash) {
  password = password.trim();

  const obj = detangle(hash, password.length);

  return crypto.createHash('sha512').update(obj.salt + password).digest('hex') === obj.hash;
}

function login(user) {
  pool.query(queries.login, [user.email], (err) => {
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
