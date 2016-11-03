#!/bin/env node

'use strict';

global.PWD = process.env.NODE_PWD || process.cwd();
global.ENV = process.env.NODE_ENV || 'development';

const p = require('path');
const crypto = require('crypto');

const chalk = require('chalk');

const mongoose = require('mongoose');

const config = require(p.join(PWD, 'server/config/membership'));

const User = require('../services/users/model');

// mpromise (built in mongoose promise library) is deprecated,
// tell mongoose to use native Promises instead
mongoose.Promise = Promise;
// connect to mongodb
mongoose.connect(config.mongo.uri, _.omit(config.mongo, 'uri'), (err) => {
  if (err) {
    console.error(err);
    process.exit();
  }

  console.info(`[${chalk.cyan('INIT')}] Mongoose is connected.`);

  createUser(...process.argv.slice(2));
});

const successPrefix = `[${chalk.green('SUCCESS')}] `;
const errorPrefix = `[${chalk.red('ERROR')}] `;

function createUser(email, password, roles) {
  if (!email || !password) {
    console.log('Usage: bin/create-user.js [email] [password] [?roles]');
    process.exit(1);
  }


  const user = new User({
    email,
    password,
    roles: roles ? roles.split(',') : ['admin'],
    isEmailVerified: true,
  });

  user.save((err) => {
    if (err) {
      console.error(errorPrefix);
      console.error(err);
      process.exit(1);
    } else {
      console.info(`${successPrefix}Saved user: ${user.ops[0].email}`);
      process.exit(0);
    }
  });
}
