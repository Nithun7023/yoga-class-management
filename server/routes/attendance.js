const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  getClassRoster,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getAttendance);
router.post('/', authorize('instructor', 'admin'), markAttendance);
router.post('/bulk', authorize('instructor', 'admin'), bulkMarkAttendance);
router.get('/class/:classId', authorize('instructor', 'admin'), getClassRoster);

module.exports = router;
