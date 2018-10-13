'use strict'

const rsql = require('@bmp/pg/require-sql')

const dir = __dirname

module.exports = {
  create: rsql('./create.sql', dir),
  getAll: rsql('./getAll.sql', dir),
}
