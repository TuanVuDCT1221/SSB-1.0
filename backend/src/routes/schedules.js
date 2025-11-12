const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const controller = require('../controllers/scheduleController');

router.get('/', auth, controller.list);
router.post('/', auth, controller.create);
module.exports = router;
