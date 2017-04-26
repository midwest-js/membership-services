'use strict';

// modules > native
const url = require('url');

// modules > 3rd party
const nodemailer = require('nodemailer');

// modules > midwest
const factory = require('midwest/factories/handlers');
const { one, many } = require('midwest/pg/result');

// modules > project
const config = require('../../config');

// modules > local
const { generateToken } = require('../users/helpers');
const queries = require('./sql');

const columns = ['id', 'email', 'dateCreated', 'createdById', 'dateModified', 'dateConsumed', 'createdById'];

const transport = nodemailer.createTransport(config.smtp);

const template = require('./email');

function create(json, client = config.db) {
  const token = generateToken();

  return client.query(queries.create, [json.email, token, json.createdById, json.roles]).then((result) => {
    const link = `${url.resolve(config.site.url, config.paths.register)}?email=${json.email}&token=${token}`;

    return transport.sendMail({
      from: config.invite.from,
      to: json.email,
      subject: config.invite.subject || `You have been invited to ${config.site.title}`,
      html: template({ site: config.site, inviter: json.createdByEmail, link }),
    }).then(() => result.rows[0]);
  });
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

module.exports = Object.assign(factory({
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
