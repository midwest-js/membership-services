'use strict';

const factory = require('midwest/factories/handlers');
const { many } = require('easy-pg/result');

const queries = require('./sql');
// modules > project
const config = require('../../config');

const columns = ['id', 'name', 'dateCreated', 'createdById', 'dateModified'];

function findByIds(ids, client = config.db) {
  return client.query(queries.findByIds, [ids]).then(many);
}

function findByNames(names, client = config.db) {
  return client.query(queries.findByNames, [names]).then(many);
}


module.exports = Object.assign(factory({
  db: config.db,
  table: 'roles',
  columns,
}), { findByIds, findByNames });
