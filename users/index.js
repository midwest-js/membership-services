'use strict';

const _ = require('lodash');
const resolveCache = require('../resolve-cache');

module.exports = _.memoize((config) => ({
  handlers: require('./handlers')(config),
  helpers: require('./helpers')(config),
  middleware: require('./middleware')(config),
  router: require('./router')(config),
}), resolveCache);
