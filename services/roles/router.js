'use strict';

const router = new (require('express')).Router();

const mw = require('./middleware');

// const { isAdmin } = require('../../passport/authorization-middleware');

const isAdmin = (req, res, next) => {
  next();
};

router.route('/')
  .get(isAdmin, mw.formatQuery, mw.paginate, mw.find)
  // .get(isAdmin, mw.getAll)
  .post(isAdmin, mw.create);

router.route('/:id')
  .get(isAdmin, mw.findById)
  .patch(isAdmin, mw.update)
  .put(isAdmin, mw.replace)
  .delete(isAdmin, mw.remove);

module.exports = router;
