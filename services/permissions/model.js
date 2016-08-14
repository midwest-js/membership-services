'use strict'

const mongoose = require('mongoose')

const PermissionSchema = new mongoose.Schema({
  regex: { type: String, required: true, unique: true },
  roles: { type: [ String ], required: true },
  dateCreated: { type: Date, default: Date.now }
})

PermissionSchema.statics.findMatches = function (email, cb) {
  const collected = []

  this.find({}, function (err, permissions) {
    if (err) cb(err)

    for (let i = 0; i < permissions.length; i++) {
      const regex = new RegExp(permissions[i].regex)

      if (email.search(regex) > -1) collected.push(permissions[i])
    }

    cb(null, collected)
  })
}

module.exports = mongoose.model('Permission', PermissionSchema)
