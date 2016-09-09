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
const providers = config.membership.providers || []

const transport = nodemailer.createTransport(config.smtp)

const mw = {
  formatQuery: require('midwest/middleware/format-query'),
  paginate: require('midwest/middleware/paginate')
}

function create(req, res, next) {
  User.create(req.body, (err, user) => {
    if (err) {
      if (req.body['local.password'])
        req.body['local.password'] = 'DELETED'

      if (req.body.local && req.body.local.password)
        req.body.local.password = 'DELETED'

      if (req.body.confirmPassword)
        req.body.confirmPassword = 'DELETED'

      return next(err)
    }

    /* HTTP specification says Location header shoult be included when creating
     * a new entity with POST
     */
    res.set('Location', req.url + '/' + user._id)
      .status(201)
      .locals.user = _.omit(user.toJSON(), 'local')

    next()
  })
}

function getRoles(req, email, callback) {
  Invite.findOne({ email }, (err, invite) => {
    if (err) return callback(err)

    let roles = invite ? invite.roles : []

    Permission.findMatches(email, (err, permissions) => {
      if (err) callback(err)

      if (permissions)
        roles = _.union(roles, ...permissions.map(permission => permission.roles))

      return callback(null, roles, invite)
    })
  })
}

const resetPasswordTemplate = require('./reset-password-email.marko')

const verifyTemplate = require('./verify-email')
const welcomeTemplate = require('./welcome-email')

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
  function generateError(err) {
    if (req.body['local.password'])
      req.body['local.password'] = 'DELETED'

    if (req.body.local && req.body.local.password)
      req.body.local.password = 'DELETED'

    if (req.body.confirmPassword)
      req.body.confirmPassword = 'DELETED'

    next(err)
  }

  if (!req.body.email) {
    if (req.body.facebook && req.body.facebook.email)
      req.body.email = req.body.facebook.email
    else {
      const err = new Error(config.membership.messages.register.missingProperties)
      err.status = 422
      return generateError(err)
    }
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return generateError(err)

    else if (user) {
      err = new Error(config.membership.messages.register.duplicateEmail)
      err.status = 409
      generateError(err)
    } else {
      req.body.email = req.body.email.toLowerCase()

      const provider = _.pick(req.body, passport.providers)

      if (!_.isEmpty(provider) && (!req.session.newUser || !_.isEqual(provider, _.pick(req.session.newUser, passport.providers)))) {
        err = new Error('The supplied user credentials does not match those retrieved from ' + _.keys(provider)[0] + '.')
        err.status = 400
        return generateError(err)
      }

      delete req.session.newUser

      const newUser = new User(req.body)

      getRoles(req, req.body.email, (err, roles, invite) => {
        if (err) return generateError(err)

        if (!roles) {
          err = new Error(config.membership.messages.register.notAuthorized)
          err.status = 401
          return generateError(err)
        }

        newUser.roles = roles

        // TEMP
        if (invite || !_.isEmpty(provider))
          newUser.isVerified = true

        newUser.save((err) => {
          if (err) return generateError(err)

          if (invite) {
            invite.dateConsumed = new Date()
            invite.save()
          }

          function respond() {
            if (req.xhr) {
              res.status(201).json(_.omit(newUser.toJSON(), 'local', ...providers))
            } else {
              res.redirect(config.membership.redirects.register)
            }
          }

          if (err) return generateError(err)

          res.status(201)

          if (newUser.isVerified) {
            req.login(newUser, () => {
              welcomeTemplate.render({ user: newUser }, (err, html) => {
                transport.sendMail({
                  from: config.site.title + ' <' + config.site.emails.robot + '>',
                  to: newUser.email,
                  subject: 'Welcome to ' + config.site.title + '!',
                  html
                }, (err) => {
                  // TODO handle error... should not be sent
                  if (err) return generateError(err)

                  respond()
                })
              })
            })
          } else {
            newUser.generateVerificationCode()

            verifyTemplate.render({ user: newUser }, (err, html) => {
              transport.sendMail({
                from: config.site.title + ' <' + config.site.emails.robot + '>',
                to: newUser.email,
                subject: 'Verify ' + config.site.title + ' account',
                html
              }, (err) => {
                // TODO handle error... should not be sent
                if (err) return generateError(err)

                respond()
              })
            })
          }
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

function sendResetPasswordLink(req, res, next) {
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
  // hide password in body
  function sendError(err) {
    if (req.body.password)
      req.body.password = 'DELETED'

    if (req.body.confirmPassword)
      req.body.confirmPassword = 'DELETED'

    next(err)
  }

  if (!req.body.email || !req.body.password || !req.body.code) {
    const err = new Error('Not enough parameters')
    err.status = 422
    return sendError(err)
  }

  User.findOne({ email: req.body.email, 'local.reset.code': req.body.code }, (err, user) => {
    if (err) return next(err)

    if (!user) {
      return sendError(Object.assign(new Error('Incorrect reset code & email combination'), {
        status: 403
      }))
    }

    if (user.local.date > Date.now() + config.membership.timeouts.changePassword)
      return sendError(Object.assign(new Error('Reset code expired'), {
        status: 403
      }))

    user.local.password = req.body.password

    user.local.reset = undefined

    user.save((err) => {
      if (err) return sendError(err)

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
  create,
  exists,
  findAll,
  findOne,
  formatQuery: mw.formatQuery([ 'limit', 'sort', 'page' ]),
  getCurrent,
  paginate: mw.paginate(User, 20),
  query,
  register,
  remove,
  sendResetPasswordLink,
  update,
  updatePassword,
  verify
}
