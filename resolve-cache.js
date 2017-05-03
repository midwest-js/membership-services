'use strict';

const _ = require('lodash');

const tests = {
  db: (value) => {
    const keys = ['query', 'connect', 'begin'];

    return keys.every((key) => _.has(value, key));
  },
};

const ok = require('ok')(tests);

const previous = [];

module.exports = (obj) => {
  const result = obj ? previous.find((item) => _.isEqual(item, obj)) : _.last(previous);

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
