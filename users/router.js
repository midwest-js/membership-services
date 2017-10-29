'use strict'

const _ = require('lodash')
const express = require('express')
const resolveCache = require('../resolve-cache')

module.exports = _.memoize((state) => {
  const router = new express.Router()
  const mw = require('./middleware')(state)

  router.param('id', (req, res, next, id) => {
    if (id === 'me') return next('route')

    next()
  })

  router.route('/')
    .get(mw.formatQuery, mw.find)
    .post(mw.create)

  router.route('/:id')
    .get(mw.findById)
    .put(mw.update)
    .patch(mw.update)
    .delete(mw.remove)

  return router
}, resolveCache)
