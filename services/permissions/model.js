'use strict'

const mongoose = require('mongoose')

const PermissionSchema = new mongoose.Schema({
  regex: { type: Object, required: true, unique: true },
  roles: { type: [ String ], required: true },
  dateCreated: { type: Date, default: Date.now }
})

PermissionSchema.statics.findMatches = function (email, cb) {
  this.find({}, (err, permissions) => {
    if (err) cb(err)

    // return only permissions whose regex match the email
    cb(null, permissions ? permissions.filter(permission => permission.regex.test(email)) : null)
  })
}

PermissionSchema.path('regex').set(function (regex) {
  return regex instanceof RegExp ? regex : new RegExp(regex)
})

module.exports = mongoose.model('Permission', PermissionSchema)
