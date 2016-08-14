'use strict'

const _ = require('lodash')

const Role = require('./model')

const mw = {
  formatQuery: require('warepot/format-query'),
  paginate: require('warepot/paginate')
}

function create(req, res, next) {
  Role.create(req.body, function (err, role) {
    if (err) return next(err)

    res.status(201)
    res.locals.role = role
    next()
  })
}

function find(req, res, next) {
  const page = Math.max(0, req.query.page) || 0
  const perPage = Math.max(0, req.query.limit) || res.locals.perPage

  const query = Role.find(_.omit(req.query, 'limit', 'sort', 'page'),
    null,
    { sort: req.query.sort || 'name', lean: true })

  if (perPage)
    query.limit(perPage).skip(perPage * page)

  query.exec((err, roles) => {
    res.locals.roles = roles
    next(err)
  })
}

function findById(req, res, next) {
  if (req.params.id === 'new') return next()

  Role.findById(req.params.id, function (err, role) {
    if (err) return next(err)

    res.status(200).locals.role = role
    next()
  })
}

function getAll(req, res, next) {
  Role.find({}, function (err, roles) {
    if (err) return next(err)

    res.status(200).locals.roles = roles
    next()
  })
}

function put(req, res, next) {
  Role.findById(req.params.id, (err, role) => {
    _.extend(role, _.omit(req.body, '_id', '__v'))

    return role.save((err) => {
      if (err) return next(err)

      return res.status(200).json(role)
    })
  })
}

function remove(req, res, next) {
  Role.remove({ _id: req.params.id }, (err) => {
    if (err) return next(err)

    res.locals.ok = true

    return next()
  })
}

module.exports = {
  create,
  find,
  findById,
  getAll,
  formatQuery: mw.formatQuery([ 'limit', 'sort', 'page' ]),
  paginate: mw.paginate(Role, 1),
  put,
  remove
}
