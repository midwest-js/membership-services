'use strict'

const passport = require('passport')

const User = require('../services/users/model')

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  done(null, user.id)
})

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

require('./req')
require('./strategies')
