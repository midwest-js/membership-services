'use strict';

// modules > native
const p = require('path');
const crypto = require('crypto');

// modules > 3rd party
const mongoose = require('mongoose');
const _ = require('lodash');
const isEmail = require('validator/lib/isEmail');

const config = require(p.join(process.cwd(), 'server/config/membership'));

const { saltLength, tokenLength, providers } = config;

const UserSchema = new mongoose.Schema(Object.assign({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail, 'Not a valid email'],
  },
  // used to verify new accounts and email changes
  emailToken: {
    email: {
      type: String,
      validate: [isEmail, 'Not a valid email'],
    },
    token: String,
    date: Date,
  },
  password: String,
  // used to reset lost password
  passwordToken: {
    token: String,
    date: Date,
  },
  roles: {
    type: [{ type: String }],
    required: true,
    default: ['member'],
  },
  lastActivity: Date,
  lastLogin: Date,
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, config.userSchema));

UserSchema.pre('validate', function (next) {
  if ((!providers || !_.has(this, ...Object.keys(providers))) && !_.get(this, 'password')) {
    this.invalidate('password', 'Path `password` must be supplied if no social login');
  }

  next();
});

UserSchema.methods.login = function () {
  this.lastLogin = Date.now();

  if (this.passwordToken) {
    delete this.passwordToken;
  }

  if (!this.loginAttempts) {
    this.loginAttempts = 0;
  }

  this.save((err) => {
    // TODO send error to error handler
    if (err) {
      console.error(err);
    }
  });
};

UserSchema.methods.generateEmailToken = function (email) {
  this.emailToken = {
    email,
    token: crypto.randomBytes(tokenLength / 2).toString('hex'),
    date: Date.now(),
  };

  // TODO make sure no errors here
  this.save();
};

UserSchema.methods.generatePasswordToken = function (next) {
  this.passwordToken = {
    date: Date.now(),
    token: crypto.randomBytes(tokenLength / 2).toString('hex'),
  };

  this.save((err) => {
    // TODO ensure response doesnt get sent twice
    next(err);
  });
};

// mix salt and hashed password into a single string
function entangle(string, salt, t) {
  const arr = (salt + string).split('');
  const length = arr.length;

  for (let i = 0; i < salt.length; i++) {
    const num = ((i + 1) * t) % length;
    const tmp = arr[i];
    arr[i] = arr[num];
    arr[num] = tmp;
  }

  return arr.join('');
}

// extract salt and hashed password from entangled string
function detangle(string, t) {
  const arr = string.split('');
  const length = arr.length;

  for (let i = saltLength - 1; i >= 0; i--) {
    const num = ((i + 1) * t) % length;
    const tmp = arr[i];
    arr[i] = arr[num];
    arr[num] = tmp;
  }

  const str = arr.join('');

  return {
    salt: str.substring(0, saltLength),
    hash: str.substring(saltLength),
  };
}

UserSchema.path('password').set((password) => {
  password = password.trim();

  const salt = crypto.randomBytes(saltLength / 2).toString('hex');

  // hash the password
  const passwordHash = crypto.createHash('sha512').update(salt + password).digest('hex');

  // entangle the hashed password with the salt and save to the model
  return entangle(passwordHash, salt, password.length);
});

UserSchema.methods.hasRole = function (role) {
  return this.roles.includes(role);
};

UserSchema.methods.authenticate = function (password) {
  password = password.trim();

  const obj = detangle(this.password, password.length);

  return crypto.createHash('sha512').update(obj.salt + password).digest('hex') === obj.hash;
};

module.exports = mongoose.model('User', UserSchema);
