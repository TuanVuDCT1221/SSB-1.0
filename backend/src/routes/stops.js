const express = require('express');
const router = express.Router();
const stopsController = require('../controllers/stopsController'); // đúng path

router.get('/', stopsController.getAllStops);
router.post('/', stopsController.createStop);
router.put('/:id', stopsController.updateStop);
router.delete('/:id', stopsController.deleteStop);

module.exports = router;
