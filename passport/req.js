'use strict';

/*
 * This file extends the req prototype with some useful functions
 *
 * @module server/passport/req.js
 */

const _ = require('lodash');

const reqProto = require('http').IncomingMessage.prototype;

const { login } = require('../services/users/helpers');

reqProto.hasRoles = function (roles) {
  if (!_.isArray(roles)) {
    roles = [roles];
  }

  return this.isAuthenticated() && _.union(this.user.roles, roles).length > 0;
};

reqProto.isAdmin = function () {
  return this.hasRoles(['admin']);
};

reqProto.originalLogin = reqProto.login;

reqProto.login = function (user, ...args) {
  console.log(user);
  login(user);

  if (this.session && this.session.newUser) {
    delete this.session.newUser;
  }

  this.originalLogin(user, ...args);
};
