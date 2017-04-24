'use strict';

const rsql = require('midwest/pg/require-sql');

const dir = __dirname;

module.exports = {
  findByIds: rsql('./findByIds.sql', dir),
  findByNames: rsql('./findByNames.sql', dir),
};
