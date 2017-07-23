'use strict'

const _ = require('lodash')
const resolveCache = require('./resolve-cache')

module.exports = _.memoize((state) => ({
  admissions: require('./admissions')(state),
  invites: require('./invites')(state),
  roles: require('./roles')(state),
  users: require('./users')(state),
}), resolveCache)
