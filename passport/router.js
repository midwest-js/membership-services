'use strict'

// modules > native
const p = require('path')

// modules > 3rd party
const passport = require('passport')
const redirect = require('midwest/middleware/redirect')
const { register } = require('../services/users/middleware')
const router = new (require('express')).Router()


require('./setup')

const config = require(p.join(process.cwd(), 'server/config/membership'))

function _401(str) {
  return Object.assign(new Error(str ? str.message || str : 'No message'), {
    status: 401
  })
}

function local(req, res, next) {
  return (err, user, message) => {
    // message will only be set if passport strategy has encountered login
    // error (not a coding error).
    if (message)
      err = _401(message)

    if (err)
      return next(err)

    if (req.body.remember) {
      if (config.remember.expires)
        req.session.cookie.expires = config.remember.expires
      else
        req.session.cookie.maxAge = config.remember && config.remember.maxAge
    }


    req.login(user, (err) => {
      if (err) return next(err)

      user = user.toObject()
      delete user.local

      res.status(200)

      res.format({
        html() {
          res.redirect(req.session.lastPath || '/')
        },
        json() {
          if (req.session.lastPath) res.set('Location', req.session.lastPath)

          res.json(user)
        }
      })
    })
  }
}

const mw = {
  local: (req, res, next) => {
    passport.authenticate('local', local(req, res, next))(req, res, next)
  },

  logout: (req, res, next) => {
    req.logout()
    res.status(200)
    res.locals.ok = true
    next()
  }
}

router
  .post('/local', mw.local)
  .get('/logout', mw.logout, redirect(config.redirects.logout))
  .post('/register', register)

module.exports = router
