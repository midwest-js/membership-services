'use strict'

const _ = require('lodash')
const factory = require('midwest/factories/rest')
const formatQuery = require('midwest/factories/format-query')
const paginate = require('midwest/factories/paginate')
const resolver = require('deep-equal-resolver')()

module.exports = _.memoize((state) => {
  const handlers = require('./handlers')(state)

  const mw = factory({
    plural: 'invites',
    handlers,
  })

  async function create (req, res, next) {
    const user = await req.user

    Object.assign(req.body, {
      createdById: user && user.id,
    })

    mw.create(req, res, next)
  }

  function getActive (req, res, next) {
    handlers.find({ active: true }, (err, invites) => {
      if (err) return next(err)

      res.locals.invites = invites

      next()
    })
  }

  function findByTokenAndEmail (req, res, next) {
    if (!req.query.token) {
      return next()
    }

    handlers.findByTokenAndEmail(req.query.token, req.query.email).then((invite) => {
      if (!invite) {
        return next(new Error('No invite found'))
      }

      if (invite.consumedAt) {
        return next(new Error('Invite already consumed'))
      }

      res.status(200).locals.invite = invite

      next()
    }).catch(next)
  }

  return Object.assign({}, mw, {
    create,
    getActive,
    findByTokenAndEmail,
    formatQuery: formatQuery(['limit', 'sort', 'page']),
    paginate: paginate(handlers.count, 20),
  })
}, resolver)
