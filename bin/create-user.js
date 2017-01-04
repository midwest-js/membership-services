#!/bin/env node

'use strict';

global.PWD = process.env.NODE_PWD || process.cwd();
global.ENV = process.env.NODE_ENV || 'development';

const p = require('path');
const crypto = require('crypto');

require('app-module-path').addPath(p.join(PWD, 'node_modules'));

const _ = require('lodash');
const chalk = require('chalk');
const pg = require('pg');

const postgresConfig = require(p.join(PWD, 'server/config/postgres'));
const config = require(p.join(PWD, 'server/config/membership'));

const client = new pg.Client(postgresConfig);

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

const { hashPassword } = require('../services/users/helpers');

function createUser(email, password, roles, urlEncoded) {
  if (!email || !password) {
    console.log('Usage: bin/create-user.js [email] [password] [?roles]');
    process.exit(1);
  }

  password = hashPassword(password);
  console.log(password)
  console.log(password.length);

  client.connect((err) => {
    client.query(`INSERT INTO users (given_name, family_name, email, password, date_email_verified) VALUES ('Linus', 'Miller', '${email}', '${password}', NOW()) RETURNING id`, (err, result) => {
      if (err) return console.log(err);

      console.log(`${successPrefix}Created user ${chalk.bold.blue(result.rows[0].email)}`);

      const userId = result.rows[0].id;

      client.end();
    });

  })
}

const queries = require('../services/users/queries');

// client.connect((err) => {
//   client.query(queries.findById, [4], (err, result) => {
//     console.log(err);
//     console.log(result);
//     // console.log(Array.isArray(result.rows[0].roles));
//     client.end();
//   })
// })
createUser(...process.argv.slice(2));
