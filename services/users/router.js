'use strict';

const router = new (require('express')).Router();

const mw = require('./middleware');

router.param('id', (req, res, next, id) => {
  if (id === 'me') return next('route');

  next();
});

router.route('/')
  .get(mw.formatQuery, mw.find)
  .post(mw.create);

router.route('/me')
  .get(mw.getCurrent)
  .patch(mw.getCurrent);

router.route('/:id')
  .get(mw.findById)
  .put(mw.update)
  .patch(mw.update)
  .delete(mw.remove);

module.exports = router;
