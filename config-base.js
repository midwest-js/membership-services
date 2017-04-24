'use strict';

module.exports = {
  timeouts: {
    // 1 day
    changePassword: 24 * 60 * 60 * 1000,
    // verify email
    verifyEmail: 7 * 24 * 60 * 60 * 1000,
  },

  paths: {
    register: '/register',
    login: '/login',
    forgotPassword: '/forgot',
    updatePassword: '/change',
    verifyEmail: '/verify',
  },

  redirects: {
    login: '/admin',
    logout: '/',
    register: '/admin',
  },

  remember: {
    // if expires is defined, it will be used. otherwise maxage
    expires: new Date('2038-01-19T03:14:07.000Z'),
    // expires: Date.now() - 1,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },

  errors: {
    login: {
      notLocal: ['Account requires external login.', 400],
      wrongPassword: ['Wrong password.', 401],
      noUserFound: ['No user registered with that email.', 400],
      noExternalUser: ['The account is not connected to this website.', 400],
      externalLoginFailed: ['External login failed.', 504],
      emailNotVerified: ['This account\'s email has not been verified.', 401],
      banned: ['User is banned.', 401],
      blocked: ['User is blocked due to too many login attempts.', 401],
    },

    register: {
      missingProperties: ['Oh no missing stuff', 422],
      notAuthorized: ['The email is not authorized to create an account.', 401],
      duplicateEmail: ['The email has already been registered.', 409],
    },
  },

  passport: {
    local: {
      usernameField: 'email',
    },

    scope: ['email'],

    //providers: {
    //  facebook: {
    //    clientID: 'change-this-fool',
    //    clientSecret: 'change-this-fool',
    //    callbackURL: p.join(config.site.domain, '/auth/facebook/callback'),
    //    passReqToCallback: true
    //  },

  },

  // needs to be even
  tokenLength: 64,
};
