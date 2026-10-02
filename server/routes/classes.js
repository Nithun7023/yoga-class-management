const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getTodayClasses,
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getClasses);
router.get('/today', protect, getTodayClasses);
router.get('/:id', getClass);

// Protected
router.post('/', protect, authorize('admin'), createClass);
router.put('/:id', protect, authorize('admin'), updateClass);
router.delete('/:id', protect, authorize('admin'), deleteClass);

module.exports = router;
