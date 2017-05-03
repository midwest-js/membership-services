'use strict';

const _ = require('lodash');
const factory = require('midwest/factories/handlers');
const { many } = require('easy-postgres/result');

const queries = require('./sql');
// modules > project
const resolveCache = require('../resolve-cache');

const columns = ['id', 'name', 'createdAt', 'createdById', 'modifiedById', 'modifiedAt'];

module.exports = _.memoize((config) => {
  function findByIds(ids, client = config.db) {
    return client.query(queries.findByIds, [ids]).then(many);
  }

  function findByNames(names, client = config.db) {
    return client.query(queries.findByNames, [names]).then(many);
  }

  return Object.assign(factory({
    db: config.db,
    table: 'roles',
    columns,
  }), { findByIds, findByNames });
}, resolveCache);
