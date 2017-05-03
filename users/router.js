'use strict';

const _ = require('lodash');
const express = require('express');
const resolveCache = require('../resolve-cache');

module.exports = _.memoize((config) => {
  const router = new express.Router();
  const mw = require('./middleware')(config);

  router.param('id', (req, res, next, id) => {
    if (id === 'me') return next('route');

    next();
  });

  router.route('/')
    .get(mw.formatQuery, mw.find)
    .post(mw.create);

  router.route('/me')
    .get(mw.getCurrent)
    .patch(mw.getCurrent);

  router.route('/:id')
    .get(mw.findById)
    .put(mw.update)
    .patch(mw.update)
    .delete(mw.remove);

  return router;
}, resolveCache);
