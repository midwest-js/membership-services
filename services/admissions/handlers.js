'use strict';

const factory = require('midwest/factories/handlers');

const columns = ['id', 'regex', 'dateCreated', 'createdById', 'dateModified'];

// modules > project
const config = require('../../config');

const handlers = factory({
  db: config.db,
  table: 'admissions',
  columns,
});

function findMatches(email) {
  return handlers.getAll().then((admissions) => {
    if (admissions) {
      admissions = admissions.filter((admission) => {
        const regex = new RegExp(admission.regex);

        return regex.test(email);
      });

      if (!admissions.length) admissions = undefined;
    }

    return admissions;
  });
}

module.exports = Object.assign(handlers, {
  findMatches,
});
