'use strict';

const _ = require('lodash');

const tests = {
  db: (value) => {
    const keys = ['query', 'connect', 'begin'];

    return keys.every((key) => _.has(value, key));
  },
};

const ok = require('ok')(tests);

module.exports = () => {
  let previous;

  return (obj) => {
    if (previous && (!obj || _.isEqual(obj, previous))) {
      return previous;
    } else {
      const errors = ok(obj);

      if (errors.length) {
        throw new Error(`Configuration is invalid: ${errors.join(', ')}`);
      }

      previous = obj;

      return obj;
    }
  };
};
