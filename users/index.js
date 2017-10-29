'use strict'

const _ = require('lodash')
const resolver = require('deep-equal-resolver')()

module.exports = _.memoize((state) => ({
  handlers: require('./handlers')(state),
  middleware: require('./middleware')(state),
  router: require('./router')(state),
}), resolver)
