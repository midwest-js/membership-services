'use strict';

const router = new (require('express')).Router();

const mw = require('./middleware');

router.route('/')
  .get(mw.formatQuery, mw.paginate, mw.find)
  .post(mw.create);

router.route('/:id')
  .get(mw.findById)
  .patch(mw.update)
  .put(mw.replace)
  .delete(mw.remove);

module.exports = router;
