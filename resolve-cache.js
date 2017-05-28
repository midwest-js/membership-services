'use strict';

const _ = require('lodash');

const tests = {
  db: (value) => {
    const keys = ['query', 'connect', 'begin'];

    return keys.every((key) => _.has(value, key));
  },
};

const ok = require('oki')(tests);

const previous = [];

module.exports = (obj) => {
  let result;

  if (obj) {
    result = previous.find((item) => _.isEqual(item, obj));
  }

  if (result) {
    return result;
  } else {
    const errors = ok(obj);

    if (errors.length) {
      throw new Error(`Configuration is invalid: ${errors.join(', ')}`);
    }

    if (obj) {
      previous.push(obj);
    }

    return obj;
  }
};
