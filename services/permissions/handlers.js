'use strict';

const factory = require('midwest/factories/handlers');

const handlers = factory('permissions');

function findMatches(email, cb) {
  handlers.getAll((err, permissions) => {
    if (err) cb(err);

    if (permissions) {
      permissions = permissions.filter((permission) => {
        const regex = new RegExp(permission.regex);

        return regex.test(email);
      });

      if (!permissions.length) permissions = undefined;
    }

    cb(null, permissions);
  });
}

module.exports = Object.assign(handlers, {
  findMatches,
});
