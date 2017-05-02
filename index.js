'use strict';

const _ = require('lodash');
const resolveCache = require('./resolve-cache');

module.exports = _.memoize((config) => ({
  admissions: require('./services/admissions')(config),
  invites: require('./services/invites')(config),
  roles: require('./services/roles')(config),
  users: require('./services/users')(config),
}), resolveCache());
