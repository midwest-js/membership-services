'use strict';

const factory = require('midwest/factories/handlers');

const columns = ['id', 'regex', 'dateCreated', 'createdById', 'dateModified'];

// modules > project
const config = require('../../config');

const handlers = factory({
  db: config.db,
  table: 'permissions',
  columns,
});

function findMatches(email) {
  return handlers.getAll().then((permissions) => {
    if (permissions) {
      permissions = permissions.filter((permission) => {
        const regex = new RegExp(permission.regex);

        return regex.test(email);
      });

      if (!permissions.length) permissions = undefined;
    }

    return permissions;
  });
}

module.exports = Object.assign(handlers, {
  findMatches,
});
