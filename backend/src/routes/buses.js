const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { permit } = require('../middlewares/role');
const controller = require('../controllers/busController');

router.get('/', auth, controller.list);
router.post('/', auth, permit('admin'), controller.create);
router.get('/:id', auth, controller.get);
router.put('/:id', auth, permit('admin'), controller.update);

module.exports = router;
