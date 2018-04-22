'use strict'

const rsql = require('@bmp/pg/require-sql')

const dir = __dirname

module.exports = {
  findByIds: rsql('./findByIds.sql', dir),
  findByNames: rsql('./findByNames.sql', dir),
}
