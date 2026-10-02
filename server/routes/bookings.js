const express = require('express');
const router = express.Router();
const { getBookings, getBooking, createBooking, cancelBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getBookings).post(authorize('member', 'admin'), createBooking);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
