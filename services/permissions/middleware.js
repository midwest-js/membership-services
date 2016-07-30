'use strict';

const _ = require('lodash');

const mw = {
  formatQuery: require('warepot/format-query'),
  paginate: require('warepot/paginate')
};

const Permission = require('./model');

module.exports = {
  create(req, res, next) {
    Permission.create(req.body, function (err, permission) {
      if (err) return next(err);

      res.locals.permission = permission;
      res.status(201);
      next();
    });
  },

  find(req, res, next) {
    const page = Math.max(0, req.query.page) || 0;
    const perPage = Math.max(0, req.query.limit) || res.locals.perPage;

    const query = Permission.find(_.omit(req.query, 'limit', 'sort', 'page'),
      null,
      { sort: req.query.sort || '-dateCreated', lean: true });

    if (perPage)
      query.limit(perPage).skip(perPage * page);

    query.exec(function (err, permissions) {
      res.locals.permissions = permissions;
      next(err);
    });
  },

  findById(req, res, next) {
    if (req.params.id === 'new') return next();

    Permission.findById(req.params.id, function (err, permission) {
      if (err) return next(err);

      res.status(200).locals.permission = permission;
      next();
    });
  },

  formatQuery: mw.formatQuery([ 'limit', 'sort', 'page' ]),

  getAll(req, res, next) {
    Permission.find({}, function (err, permissions) {
      if (err) return next(err);

      res.status(200).locals.permissions = permissions;
      next();
    });
  },

  getActive(req, res, next) {
    Permission.find({ active: true }, function (err, permissions) {
      if (err) return next(err);

      res.status(200).locals.permissions = permissions;
      next();
    });
  },

  paginate: mw.paginate(Permission, 20),

  put(req, res, next) {
    Permission.findById(req.params.id, function (err, permission) {
      _.difference(_.keys(permission.toObject()), _.keys(req.body)).forEach(function (key) {
        permission[key] = undefined;
      });

      _.extend(permission, _.omit(req.body, '_id', '__v'));

      return permission.save(function (err) {
        if (err) return next(err);

        return res.status(200).json(permission);
      });
    });
  },

  remove(req, res, next) {
    Permission.remove({ _id: req.params.id }, function (err) {
      if (err) return next(err);

      res.locals.ok = true;

      return next();
    });
  }
};
