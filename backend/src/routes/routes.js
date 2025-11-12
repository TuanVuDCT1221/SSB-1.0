const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/routeController');

router.get('/', auth, controller.list);
router.post('/', auth, controller.create);
router.get('/:id/stops', auth, controller.stopsByRoute);

module.exports = router;
