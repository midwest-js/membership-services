'use strict'

// modules > native
const url = require('url')
const p = require('path')

// modules > 3rd party
const _ = require('lodash')
const requireDir = require('require-dir')
const nodemailer = require('nodemailer')
const passport = require('passport')

// models
const User = require('./model')
const Permission = require('../permissions/model')
const Invite = require('../invites/model')

const config = requireDir(p.join(process.cwd(), 'server/config'))

const transport = nodemailer.createTransport(config.smtp)

const mw = {
  formatQuery: require('warepot/format-query'),
  paginate: require('warepot/paginate')
}


function getRoles(req, email, callback) {
  if (!req.body.roles) {
    Invite.findOne({ email }, (err, invite) => {
      if (err) return callback(err)

      let roles = invite ? invite.roles : []

      Permission.findMatches(email, (err, permissions) => {
        if (err) callback(err)

        roles = _.union(roles, ...permissions.map(permission => permission.roles))

        return callback(null, roles, invite)
      })
    })
  } else if (req.isAdmin()) {
    return callback(null, req.body.roles)
  } else {
    return callback(null, [])
  }
}

const resetPasswordTemplate = require('./reset-password-email.marko')
//const verifyTemplate = require('./verify-email')
//const welcomeTemplate = require('./welcome-email')

// middleware that checks if an email and reset code are valid
function checkReset(req, res, next) {
  User.findOne({ email: req.query.email, 'local.reset.code': req.query.code }, (err, user) => {
    if (err) return next(err)

    if (!user) {
      err = new Error('Reset code not found for user.')
      err.status = 404
      err.details = req.query
      return next(err)
    }

    if (user.local.reset.date.getTime() + (24 * 60 * 60 * 1000) < Date.now()) {
      err = new Error('Reset code has expired.')
      err.status = 410
      err.details = req.query
      return next(err)
    }

    next()
  })
}

function exists(property) {
  return (req, res, next) => {
    // TODO maybe return true?
    if (!req.query[property])
      return res.json(false)

    const query = {
      [property]: req.query[property]
    }

    User.findOne(query, (err, user) => {
      if (err) return next(err)

      // return true if user is found
      return res.json(!!user)
    })
  }
}

function findOne(req, res, next) {
  if (req.params.id === 'me')
    return next()

  User.findById(req.params.id).lean().exec((err, user) => {
    if (err) return next(err)

    res.locals.user = _.omit(user, [ 'local', 'facebook' ])
    next()
  })
}

function findAll(req, res, next) {
  User.find(req.query, (err, users) => {
    if (err) return next(err)

    res.locals.users = users

    return next()
  })
}

function getCurrent(req, res, next) {
  res.locals.user = req.user && _.omit(req.user.toJSON(), [ 'local', 'facebook' ])

  next()
}

function query(req, res, next) {
  const page = Math.max(0, req.query.page) || 0
  const perPage = Math.max(0, req.query.limit) || res.locals.perPage

  const query = User.find(_.omit(req.query, 'limit', 'sort', 'page'),
    null,
    { sort: req.query.sort || 'name', lean: true })

  if (perPage)
    query.limit(perPage).skip(perPage * page)

  query.exec((err, roles) => {
    res.locals.roles = roles
    next(err)
  })
}

function register(req, res, next) {
  if (!req.body.email) {
    if (req.body.facebook && req.body.facebook.email)
      req.body.email = req.body.facebook.email
    else
      return next(new Error(config.membership.messages.register.missingProperties))
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) next(err)

    else if (user) {
      err = new Error(config.membership.messages.register.duplicateEmail)
      err.status = 409
      next(err)
    } else {
      req.body.email = req.body.email.toLowerCase()

      const provider = _.pick(req.body, passport.providers)

      if (!_.isEmpty(provider) && (!req.session.newUser || !_.isEqual(provider, _.pick(req.session.newUser, passport.providers)))) {
        err = new Error('The supplied user credentials does not match those retrieved from ' + _.keys(provider)[0] + '.')
        err.status = 400
        return next(err)
      }

      delete req.session.newUser

      const newUser = new User(req.body)

      getRoles(req, req.body.email, (err, roles, invite) => {
        if (err) return next(err)

        if (roles.length < 1) {
          err = new Error(config.membership.messages.register.notAuthorized)
          err.status = 401
          return next(err)
        }

        newUser.roles = roles

        // TEMP
        newUser.isVerified = true

        newUser.save((err) => {
          if (invite) {
            invite.dateConsumed = new Date()
            invite.save()
          }

          req.login(newUser, () => res.status(201).json(newUser))
          //function respond() {
          //  if (req.xhr) {
          //    res.json(_.isEmpty(provider) ? null : _.omit(newUser.toJSON(), [ 'local' ].concat(passport.providers)))
          //  } else {
          //    res.redirect('/registered')
          //  }
          //}

          //if (err) return next(err)

          //res.status(201)

          //if (!_.isEmpty(provider)) {
          //  newUser.isVerified = true
          //  req.login(newUser, respond)
          //} else {
          //  res.locals.ok = true
          //  newUser.generateVerificationCode()
          //  verifyTemplate.render({ user: newUser }, (err, html) => {
          //    transport.sendMail({
          //      from: config.site.title + ' <' + config.site.emails.robot + '>',
          //      to: newUser.email,
          //      subject: 'Verify ' + config.site.title + ' account',
          //      html
          //    }, (err) => {
          //      // TODO handle error... should not be sent
          //      if (err) return next(err)

          //      respond()
          //    })
          //  })
          //}
        })
      })
    }
  })
}

function remove(req, res, next) {
  User.remove({ _id: req.params.id }, (err, count) => {
    if (err) return next(err)

    if (count > 0) {
      res.statusCode = 200
      res.message = {
        type: 'success',
        heading: 'The user has been removed.'
      }
    } else {
      res.statusCode = 410
      res.message = {
        type: 'error',
        heading: 'No user was found, thus none was removed.'
      }
    }
    return next()
  })
}

function resetPassword(req, res, next) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return next(err)

    if (!user) {
      err = new Error('No user with email')
      err.status = 404
      err.details = req.body
      return next(err)
    }

    user.resetPassword((err) => {
      if (err) return next(err)

      const link = url.resolve(config.site.url, config.membership.paths.updatePassword) + '?email=' + encodeURI(user.email) + '&code=' + user.local.reset.code

      resetPasswordTemplate.render({ link }, (err, html) => {
        if (err) next(err)

        transport.sendMail({
          from: config.site.title + ' <' + config.site.emails.robot + '>',
          to: user.email,
          subject: 'Reset ' + config.site.title + ' password',
          html
        }, function () {
        // TODO handle error... should not be sent

          res.status(200).json({ ok: true })
        })
      })
    })
  })
}

function update(req, res, next) {
  User.findById(req.params.id, (err, user) => {
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim()
    }

    _.extend(user, _.omit(req.body, [ '_id', '__v', 'local', 'facebook' ]))

    user.save((err) => {
      if (err) {
        return next(err)
      }

      res.status(201)
      res.locals.user = _.omit(req.user.toJSON(), [ 'local', 'facebook' ])

      return next()
    })
  })
}

function updatePassword(req, res, next) {
  if (!req.body.email || !req.body.password || !req.body.code) {
    return next(new Error('Not enough parameters'))
  }

  User.findOne({ email: req.body.email, 'local.reset.code': req.body.code }, (err, user) => {
    if (err) return next(err)

    if (!user) {
      return next(_.extend(new Error('No user found'), {
        status: 404,
        details: _.omit(req.body.password)
      }))
    }

    user.local.password = req.body.password

    user.local.reset = undefined

    user.save((err) => {
      if (err) return next(err)

      res.status(200).json({ ok: true })
    })
  })
}

// middleware that checks if an email and reset code are valid
function verify(req, res, next) {
  User.findOne({ email: req.query.email, 'local.verificationCode': req.query.code }, (err, user) => {
    if (err) return next(err)

    if (!user) {
      err = new Error('Verification code not found for user.')
      err.status = 404
      err.details = req.query
      return next(err)
    }

    if (user.dateCreated.getTime() + (24 * 60 * 60 * 1000) < Date.now()) {
      err = new Error('Verification code has expired.')
      err.status = 410
      err.details = req.query
      return next(err)
    }

    user.isVerified = true
    delete user.local.verificationCode
    user.save(() => {
      req.login(user, () => {
        res.redirect('/registered')
      })
    })
  })
}

module.exports = {
  checkReset,
  exists,
  findAll,
  findOne,
  formatQuery: mw.formatQuery([ 'limit', 'sort', 'page' ]),
  getCurrent,
  paginate: mw.paginate(User, 20),
  query,
  register,
  remove,
  resetPassword,
  update,
  updatePassword,
  verify
}
