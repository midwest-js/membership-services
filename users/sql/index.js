'use strict'

const rsql = require('easy-postgres/require-sql')

const dir = __dirname

module.exports = {
  addRoles: rsql('./addRoles.sql', dir),
  create: rsql('./create.sql', dir),
  findByEmail: rsql('./findByEmail.sql', dir),
  findById: rsql('./findById.sql', dir),
  find: rsql('./find.sql', dir),
  getAll: rsql('./getAll.sql', dir),
  updateRoles: rsql('./updateRoles.sql', dir),
}
