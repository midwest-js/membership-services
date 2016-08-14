'use strict'

const p = require('path')

module.exports = {
  membership: require(p.join(process.cwd(), 'server/config/membership')),
  site: require(p.join(process.cwd(), 'server/config/site')),
  smtp: require(p.join(process.cwd(), 'server/config/smtp'))
}
