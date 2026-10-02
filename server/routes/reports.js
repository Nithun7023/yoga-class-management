const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAttendanceReport,
  getRevenueReport,
  getMembershipReport,
  getClassReport,
  getMemberGrowthReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'instructor'));

router.get('/dashboard', getDashboardStats);
router.get('/attendance', getAttendanceReport);
router.get('/revenue', authorize('admin'), getRevenueReport);
router.get('/membership', authorize('admin'), getMembershipReport);
router.get('/classes', getClassReport);
router.get('/members', authorize('admin'), getMemberGrowthReport);

module.exports = router;
