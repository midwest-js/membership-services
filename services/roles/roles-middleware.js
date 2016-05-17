'use strict';

const _ = require('lodash');

const Role = require('./roles-model');

const mw = {
  formatQuery: require('warepot/format-query'),
  paginate: require('warepot/paginate')
};

module.exports = {
  create(req, res, next) {
    Role.create(req.body, function (err, role) {
      if (err) return next(err);

      res.status(201);
      res.locals.role = role;
      next();
    });
  },

  find(req, res, next) {
    const page = Math.max(0, req.query.page) || 0;
    const perPage = Math.max(0, req.query.limit) || res.locals.perPage;

    const query = Role.find(_.omit(req.query, 'limit', 'sort', 'page'),
      null,
      { sort: req.query.sort || 'name', lean: true });

    if (perPage)
      query.limit(perPage).skip(perPage * page);

    query.exec((err, roles) => {
      res.locals.roles = roles;
      next(err);
    });
  },

  findById(req, res, next) {
    if (req.params.id === 'new') return next();

    Role.findById(req.params.id, function (err, role) {
      if (err) return next(err);

      res.status(200).locals.role = role;
      next();
    });
  },

  formatQuery: mw.formatQuery([ 'limit', 'sort', 'page' ]),

  getAll(req, res, next) {
    Role.find({}, function (err, roles) {
      if (err) return next(err);

      res.status(200).locals.roles = roles;
      next();
    });
  },

  paginate: mw.paginate(Role, 1),

  put(req, res, next) {
    Role.findById(req.params.id, (err, role) => {
      _.extend(role, _.omit(req.body, '_id', '__v'));

      return role.save((err) => {
        if (err) return next(err);

        return res.status(200).json(role);
      });
    });
  },

  remove(req, res, next) {
    Role.remove({ _id: req.params.id }, (err) => {
      if (err) return next(err);

      res.locals.ok = true;

      return next();
    });
  }
};
