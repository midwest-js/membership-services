#!/bin/env node

'use strict';

global.PWD = process.env.NODE_PWD || process.cwd();
global.ENV = process.env.NODE_ENV || 'development';

const p = require('path');
const crypto = require('crypto');

const chalk = require('chalk');
const _ = require('lodash');

const mongoose = require('mongoose');

const config = require(p.join(PWD, 'server/config/membership'));
const mongoConfig = require(p.join(PWD, 'server/config/mongo'));

const User = require('../services/users/model');

const successPrefix = `[${chalk.green('SUCCESS')}]`;
const errorPrefix = `[${chalk.red('ERROR')}]`;

function parseUrlEncoded(str) {
  return str && str.split('&').reduce((result, split) => {
    const [key, value] = split.split('=');

    if (value) {
      result[key] = value;
    }

    return result;
  }, {})
}

function createUser(email, password, roles, urlEncoded) {
  if (!email || !password) {
    console.log('Usage: bin/create-user.js [email] [password] [?roles]');
    process.exit(1);
  }


  const user = new User(Object.assign({
    email,
    password,
    roles: roles ? roles.split(',') : ['admin'],
    isEmailVerified: true,
  }, parseUrlEncoded(urlEncoded)));

  user.save((err) => {
    if (err) {
      console.error(errorPrefix);
      console.error(err);
      process.exit(1);
    } else {
      console.info(`${successPrefix} User ${chalk.bold.blue(user.email)} has been created.`);
      process.exit(0);
    }
  });
}

// mpromise (built in mongoose promise library) is deprecated,
// tell mongoose to use native Promises instead
mongoose.Promise = Promise;
// connect to mongodb
mongoose.connect(mongoConfig.uri, _.omit(mongoConfig, 'uri'), (err) => {
  if (err) {
    console.error(`${errorPrefix} Mongoose connection error:`);
    console.error(err);
    process.exit();
  }


  createUser(...process.argv.slice(2));
});

