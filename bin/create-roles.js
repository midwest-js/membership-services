#!/bin/env node

'use strict';

const PWD = process.env.NODE_PWD || process.cwd();

const p = require('path');
const chalk = require('chalk');

const MongoClient = require('mongodb').MongoClient;

const successPrefix = `[${chalk.green('SUCCESS')}] `;
const errorPrefix = `[${chalk.red('ERROR')}] `;
global.PWD = p.dirname(__dirname);
global.ENV = process.env.NODE_ENV || 'development';

function _mongo(collection, cb) {
  const mongoConfig = require(p.join(PWD, 'server/config/mongo'));

  MongoClient.connect(mongoConfig.uri, (err, db) => {
    if (err) {
      console.error(errorPrefix);
      console.error(err);
      process.exit(1);
    }
    cb(db.collection(collection), db);
  });
}

function createRoles(roles) {
  const roleNames = (roles ? roles.split(',') : ['user', 'admin']);

  _mongo('roles', (roles, db) => {
    roles.insert(roleNames.map((role) => ({ name: role })), (err) => {
      db.close();
      if (err) {
        console.error(errorPrefix);
        console.error(err);
        process.exit(1);
      } else {
        console.log(`${successPrefix}Created roles: ${roleNames.join(', ')}`);
        process.exit(0);
      }
    });
  });
}

createRoles();
