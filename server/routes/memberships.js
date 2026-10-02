const express = require('express');
const router = express.Router();
const {
  getPlans, createPlan, updatePlan, deletePlan,
  getMemberships, getMembership, createMembership, updateMembership,
  getPayments, createPayment, updatePayment,
} = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Plans
router.route('/plans').get(getPlans).post(authorize('admin'), createPlan);
router.route('/plans/:id').put(authorize('admin'), updatePlan).delete(authorize('admin'), deletePlan);

// Memberships
router.route('/').get(getMemberships).post(authorize('admin'), createMembership);
router.route('/:id').get(getMembership).put(authorize('admin'), updateMembership);

// Payments
router.route('/payments').get(getPayments).post(authorize('admin'), createPayment);
router.route('/payments/:id').put(authorize('admin'), updatePayment);

module.exports = router;
