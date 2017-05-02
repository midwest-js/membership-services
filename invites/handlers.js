'use strict';

// modules > 3rd party
const _ = require('lodash');

// modules > midwest
const factory = require('midwest/factories/handlers');
const { one, many } = require('easy-pg/result');
const resolveCache = require('../resolve-cache');
const { generateToken } = require('../users/helpers');
const queries = require('./sql');

const columns = ['id', 'email', 'dateCreated', 'createdById', 'dateModified', 'dateConsumed', 'createdById'];

module.exports = _.memoize((config) => {
  function create(json, client = config.db) {
    const token = generateToken();

    const promise = client.query(queries.create, [json.email, token, json.createdById, json.roles]).then(one);

    if (config.hooks && config.hooks.invite) {
      return promise.then(config.hooks.invite);
    } else {
      return promise;
    }
  }

  function find(json, client = config.db) {
    const offset = Math.max(0, json.offset);

    return client.query(queries.find, [offset]).then(many);
  }

  function findById(id, client = config.db) {
    return client.query(queries.findById, [id]).then(one);
  }

  function findByEmail(email, client = config.db) {
    return client.query(queries.findByEmail, [email]).then(one);
  }

  function findByTokenAndEmail(token, email, client = config.db) {
    return client.query(queries.findByTokenAndEmail, [token, email]).then(one);
  }

  function getAll(client = config.db) {
    return client.query(queries.getAll).then(many);
  }

  function consume(id, client = config.db) {
    const query = 'UPDATE invites SET date_consumed = NOW() WHERE id = $1;';

    return client.query(query, [id]).then((result) => {
      if (result.rowCount === 0) throw new Error('Invite not consumed');
    });
  }

  return Object.assign(factory({
    db: config.db,
    table: 'invites',
    columns,
    exclude: ['create', 'getAll', 'find', 'findById'],
  }), {
    create,
    find,
    findByEmail,
    findById,
    findByTokenAndEmail,
    getAll,
    consume,
  });
}, resolveCache());
