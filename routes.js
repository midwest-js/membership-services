'use strict';

module.exports = [].concat(
  require('./services/invites/invites-routes'),
  require('./services/roles/roles-routes'),
  require('./services/permissions/permissions-routes'),
  require('./services/users/users-routes'),
  require('./passport/routes')
);
