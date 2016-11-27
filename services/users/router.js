'use strict';

const router = new (require('express')).Router();

const mw = require('./middleware');

const { isAuthenticated, isAdmin } = require('../../passport/authorization-middleware');

router.param('id', (req, res, next, id) => {
  if (id === 'me') return next('route');

  next();
});

router.route('/')
  .get(isAdmin, mw.formatQuery, mw.find)
  .post(isAdmin, mw.create);

router.route('/me')
  .get(isAuthenticated, mw.getCurrent)
  .patch(isAuthenticated, mw.getCurrent);

router.route('/:id')
  .get(isAdmin, mw.findById)
  .put(isAdmin, mw.update)
  .patch(isAdmin, mw.update)
  .delete(isAdmin, mw.remove);

module.exports = router;
