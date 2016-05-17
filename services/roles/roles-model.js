'use strict';

const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  dateCreated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', RoleSchema);
