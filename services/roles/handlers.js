'use strict';

const factory = require('midwest/factories/handlers');

const columns = ['id', 'name', 'dateCreated', 'createdById', 'dateModified'];

module.exports = factory('roles', columns);
