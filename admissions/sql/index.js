'use strict'

const rsql = require('@bmp/pg/require-sql')

const dir = __dirname

module.exports = {
  getAll: rsql('./getAll.sql', dir),
}
