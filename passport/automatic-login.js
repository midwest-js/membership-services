'use strict'

/* Middleware simply for simplying when in development
 * mode so that you do not have to re-login everytime the
 * node server reboots. set global.LOGIN_USER to the user you wish
 * to automatically login as.
 */

const User = require('../services/users/model')

module.exports = function automaticLogin(req, res, next) {
  if (ENV === 'development' && global.LOGIN_USER && !req.user) {
    User.findOne({ email: LOGIN_USER }, (err, user) => {
      if (err) return next(err)

      if (!user) return next()

      req.login(user, (err) => {
        if (err) return next(err)

        next()
      })
    })
  } else {
    next()
  }
}
