'use strict';

const _ = require('lodash');
const resolveCache = require('../resolve-cache');

module.exports = _.memoize((state) => ({
  handlers: require('./handlers')(state),
  helpers: require('./helpers')(state),
  middleware: require('./middleware')(state),
  router: require('./router')(state),
}), resolveCache);
