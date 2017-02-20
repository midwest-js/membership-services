'use strict';

const config = require('./config');

exports.configure = (userConfig) => {
  Object.assign(config, userConfig);
};
