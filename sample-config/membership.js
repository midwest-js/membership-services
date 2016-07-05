'use strict';

const p = require('path');

const config = {
  smtp: require('./smtp'),
  site: require('./site')
};

module.exports = {
  invite: {
    from: config.site.title + ' Robot <' + config.site.emails.robot + '>',
    subject: 'You have been invited to ' + config.site.title
  },

  paths: {
    register: '/register',
    login: '/login',
    forgotPassword: '/forgot-password',
    updatePassword: '/update-password'
  },

  remember: {
    // if expires is defined, it will be used. otherwise maxage
    expires: new Date('2038-01-19T03:14:07.000Z'),
    //expires: Date.now() - 1,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },

  messages: {
    login: {
      notLocal: 'Account requires external login.',
      wrongPassword: 'Wrong password.',
      noLocalUser: 'No user registered with that email.',
      noExternalUser: 'The account is not connected to this website.',
      externalLoginFailed: 'External login failed.',
      unverified: 'This account has not been verified.',
      banned: 'User is banned.',
      blocked: 'User is blocked due to too many login attempts.'
    },

    register: {
      notAuthorized: 'The email is not authorized to create an account.',
      duplicateEmail: 'The email has already been registered.'
    }
  },

  passport: {
    local: {
      usernameField: 'email'
    },

    scope: [ 'email' ],

    providers: {
      facebook: {
        clientID: 'change-this-fool',
        clientSecret: 'change-this-fool',
        callbackURL: p.join(config.site.domain, '/auth/facebook/callback'),
        passReqToCallback: true
      },

      google: {
        clientID: 'change-this-fool',
        clientSecret: 'change-this-fool',
        callbackURL: p.join(config.site.domain, '/auth/google/callback'),
        passReqToCallback: true
      }
    }
  }
};
