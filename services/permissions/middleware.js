'use strict';

const rest = require('midwest/factories/rest');
const formatQuery = require('midwest/factories/format-query');
const paginate = require('midwest/factories/paginate');

const Permission = require('./model');

const mw = rest(Permission);

module.exports = Object.assign({}, mw, {
  formatQuery: formatQuery(['limit', 'sort', 'page']),
  paginate: paginate(Permission, 20),
  findById: (req, res, next) => {
    mw.findById(req, res, (err) => {
      if (err) return next(err);

      if (res.locals.permission) {
        res.locals.permission.regex = res.locals.permission.regex.source;
      }

      next();
    });
  },
  query: (req, res, next) => {
    mw.query(req, res, (err) => {
      if (err) return next(err);

      res.locals.permissions.forEach((permission) => {
        permission.regex = permission.regex.source;
      });

      next();
    });
  },
});
