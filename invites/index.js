'use strict'

const _ = require('lodash')
const resolveCache = require('../resolve-cache')

module.exports = _.memoize((state) => ({
  router: require('./router')(state),
  middleware: require('./middleware')(state),
  handlers: require('./handlers')(state),
}), resolveCache)
