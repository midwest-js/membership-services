'use strict';

const _ = require('lodash');
const resolveCache = require('./resolve-cache');

module.exports = _.memoize((config) => ({
  admissions: require('./admissions')(config),
  invites: require('./invites')(config),
  roles: require('./roles')(config),
  users: require('./users')(config),
}), resolveCache);
