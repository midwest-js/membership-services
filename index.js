'use strict';

const _ = require('lodash');
const deepFreeze = require('deep-freeze');

const config = require('./config-base');

exports.configure = (userConfig) => {
  _.merge(config, userConfig);

  deepFreeze(config);
};
