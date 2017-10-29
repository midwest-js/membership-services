'use strict'

const _ = require('lodash')
const resolver = require('deep-equal-resolver')()

module.exports = _.memoize((state) => ({
  router: require('./router')(state),
  middleware: require('./middleware')(state),
  handlers: require('./handlers')(state),
}), resolver)
