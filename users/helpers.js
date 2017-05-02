'use strict';

const _ = require('lodash');
const crypto = require('crypto');
const scrypt = require('scrypt-for-humans');
const resolveCache = require('../resolve-cache');

module.exports = _.memoize((config) => {
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

  return {
    authenticate,
    generateEmailToken,
    generatePasswordToken,
    generateToken,
    hashPassword,
  };
}, resolveCache());
