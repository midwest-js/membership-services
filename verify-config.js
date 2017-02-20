'use strict';

const _ = require('lodash');

const paths = ['db', 'invite.from', 'smtp', 'site.url', 'site.title'];

module.exports = (conf) => {
  const missing = paths.filter((path) => !_.has(conf, path));

  if (missing.length) {
    throw new Error('Configuration is missing, ' + missing);
  }
};
