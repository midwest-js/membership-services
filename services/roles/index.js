'use strict';

const _ = require('lodash');
const resolveCache = require('../../resolve-cache');

module.exports = _.memoize((config) => ({
  router: require('./router')(config),
  middleware: require('./middleware')(config),
  handlers: require('./handlers')(config),
}), resolveCache());
