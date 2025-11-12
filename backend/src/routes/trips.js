const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { permit } = require('../middlewares/role');
const controller = require('../controllers/tripController');

router.post('/:scheduleId/start', auth, permit('driver'), controller.startTrip);
router.post('/:tripId/end', auth, permit('driver','admin'), controller.endTrip);

// REST fallback for location update (if not using socket)
router.post('/:tripId/location', auth, permit('driver'), controller.updateLocation);

// list in_progress trips for admin
router.get('/in_progress/all', auth, permit('admin'), controller.listInProgress);

// student pickup/dropoff via REST
router.post('/:tripId/student/:studentId/pickup', auth, permit('driver'), controller.pickupStudent);
router.post('/:tripId/student/:studentId/dropoff', auth, permit('driver'), controller.dropoffStudent);

module.exports = router;
