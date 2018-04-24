'use strict'

// modules > 3rd party
const _ = require('lodash')

const formatQuery = require('midwest/factories/format-query')
const paginate = require('midwest/factories/paginate')
const factory = require('midwest/factories/rest')
const resolver = require('deep-equal-resolver')()

module.exports = _.memoize((state) => {
  const handlers = {
    invites: require('../invites/handlers')(state),
    admissions: require('../admissions/handlers')(state),
    roles: require('../roles/handlers')(state),
    users: require('./handlers')(state),
  }

  function create (req, res, next) {
    handlers.users.create(req.body).then((user) => {
      /* HTTP specification says Location header shoult be included when creating
       * a new entity with POST
       */
      res.set('Location', `${req.url}/${user._id}`)
        .status(201)
        .locals.user = _.omit(user.toJSON(), 'local')

      next()
    }).catch(next)
  }

  return Object.assign(factory({
    plural: 'users',
    handlers: handlers.users,
  }), {
    create,
    formatQuery: formatQuery(['limit', 'sort', 'page', 'isBanned', 'isBlocked', 'isMuted', 'isVerified', 'isEmailVerified'], {
      username: 'regex',
      givenName: 'regex',
      familyName: 'regex',
    }),
    paginate: paginate(handlers.users.count, 20),
  })
}, resolver)
