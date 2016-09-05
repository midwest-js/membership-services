'use strict'

// modules > native
const url = require('url')
const p = require('path')

// modules > 3rd party
const rest = require('midwest/middleware/rest')
const formatQuery = require('midwest/middleware/format-query')
const paginate = require('midwest/middleware/paginate')
const requireDir = require('require-dir')
const nodemailer = require('nodemailer')

// modules > local
const Invite = require('./model')
const template = require('./email.marko')

const config = requireDir(p.join(process.cwd(), 'server/config'))

const smtpTransport = nodemailer.createTransport(config.smtp)

function create(req, res, next) {
  req.body.inviter = {
    _id: req.user._id,
    email: req.user.email
  }

  Invite.create(req.body, (err, invite) => {
    if (err) return next(err)

    const link = url.resolve(config.site.url, config.membership.paths.register) + '?email=' + invite.email + '&code=' + invite._id

    template.render({ site: config.site, invite, link }, (err, html) => {
      if (err) return next(err)

      smtpTransport.sendMail({
        from: config.membership.invite.from,
        to: req.body.email,
        subject: config.membership.invite.subject,
        html
      }, (err) => {
        if (err) return next(err)

        res.status(201).locals.invite = invite

        return next()
      })
    })
  })
}

function getActive(req, res, next) {
  Invite.find({ active: true }, (err, invites) => {
    if (err) return next(err)
    res.locals.invites = invites
    next()
  })
}

function getByQuery(req, res, next) {
  if (!req.query.code)
    return next()

  Invite.findById(req.query.code, (err, invite) => {
    if (err) return next(err)

    if (!invite || invite.email !== req.query.email || invite.dateConsumed)
      return next()

    res.status(200).locals.invite = invite

    next()
  })
}

module.exports = Object.assign(rest(Invite), {
  create,
  formatQuery: formatQuery([ 'limit', 'sort', 'page' ]),
  getActive,
  getByQuery,
  paginate: paginate(Invite, 20),
})
