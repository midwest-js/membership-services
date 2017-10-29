'use strict'

const _ = require('lodash')
const resolver = require('deep-equal-resolver')()

module.exports = _.memoize((state) => ({
  admissions: require('./admissions')(state),
  invites: require('./invites')(state),
  roles: require('./roles')(state),
  users: require('./users')(state),
}), resolver)
