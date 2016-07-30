'use strict';

// modules > native
const crypto = require('crypto');

// modules > 3rd party
const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
	_id: String,
	email: { type: String, required: true, unique: true },
	roles: { type: [ String ], required: true },
	inviter: {
		_id: { type: mongoose.Schema.ObjectId, ref: 'UserSchema', required: true },
		email: { type: String, required: true }
	},
	dateCreated: {
		type: Date,
		default: Date.now
	},
	dateConsumed: Date
});

InviteSchema.pre('validate', function (done) {
	if (this.isNew) {
		const date = Date.now();
		const chars = '0123456789abcdefghijklmnopqurstuvwxyz';
		let salt = '';

		for (let i = 0; i < 12; i++) {
			const j = Math.floor(Math.random() * chars.length);
			salt += chars[j];
		}

		this._id = crypto.createHash('sha256').update(date + salt + this.email).digest('hex');
	}

	done();
});

module.exports = mongoose.model('Invite', InviteSchema);
