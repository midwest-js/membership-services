'use strict'

const _ = require('lodash')
const express = require('express')
const resolver = require('deep-equal-resolver')()

module.exports = _.memoize((state) => {
  const router = new express.Router()
  const mw = require('./middleware')(state)

  router.route('/')
    .get(mw.formatQuery, mw.paginate, mw.find)
    .post(mw.create)

  router.route('/:id')
    .get(mw.findById)
    .patch(mw.update)
    .put(mw.replace)
    .delete(mw.remove)

  return router
}, resolver)
