const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { permit } = require('../middlewares/role');
const { listUsers, getUser } = require('../controllers/userController');

router.get('/', auth, permit('admin'), listUsers);
router.get('/:id', auth, getUser);

module.exports = router;
