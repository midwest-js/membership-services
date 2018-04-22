'use strict'

const rsql = require('@bmp/pg/require-sql')

const dir = __dirname

module.exports = {
  create: rsql('./create.sql', dir),
  find: rsql('./find.sql', dir),
  findByEmail: rsql('./findByEmail.sql', dir),
  findById: rsql('./findById.sql', dir),
  findByTokenAndEmail: rsql('./findByTokenAndEmail.sql', dir),
  getAll: rsql('./getAll.sql', dir),
}
