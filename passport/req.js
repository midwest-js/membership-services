/*
 * This file extends the req prototype with some useful functions
 *
 * @module server/passport/req.js
 */

'use strict';

const reqProto = require('http').IncomingMessage.prototype;

reqProto.hasRoles = function (roles) {
  if (!_.isArray(roles)) roles = [ roles ];

  return this.isAuthenticated() && roles.every(this.user.hasRole);
};

reqProto.isAdmin = function () {
  return this.hasRoles([ 'admin' ]);
};

reqProto._login = reqProto.login;

reqProto.login = function (user, req) {
  user.login();

  if (this.session && this.session.newUser)
    delete req.session.newUser;

  this._login.apply(this, arguments);
};

