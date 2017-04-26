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

function createAdmission(regex, roles) {
  roles = roles.split(',');

  _mongo('admissions', (admission, db) => {
    admission.insert({
      regex: new RegExp(regex),
      roles,
      dateCreated: new Date(),
    }, (err) => {
      db.close();
      if (err) {
        console.error(errorPrefix);
        console.error(err);
        process.exit(1);
      } else {
        console.info(`${successPrefix}Created admission: ${regex} with roles ${roles.join(', ')}`);
        process.exit(0);
      }
    });
  });
}

createAdmission(...process.argv.slice(2));
