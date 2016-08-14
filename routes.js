'use strict'

module.exports = [
  ...require('./services/invites/routes'),
  ...require('./services/roles/routes'),
  ...require('./services/permissions/routes'),
  ...require('./services/users/routes'),
  ...require('./passport/routes')
]
