'use strict';

const _ = require('lodash');
const express = require('express');
const resolveCache = require('../../resolve-cache');

module.exports = _.memoize((config) => {
  const router = new express.Router();
  const mw = require('./middleware')(config);

  router.route('/')
    .get(mw.formatQuery, mw.paginate, mw.find)
    .post(mw.create);

  router.route('/:id')
    .get(mw.findById)
    .patch(mw.update)
    .put(mw.replace)
    .delete(mw.remove);

  return router;
}, resolveCache());
