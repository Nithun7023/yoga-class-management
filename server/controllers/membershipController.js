const MembershipPlan = require('../models/MembershipPlan');
const Membership = require('../models/Membership');
const Payment = require('../models/Payment');
const { paginate } = require('../utils/pagination');

// ─── Membership Plans ────────────────────────────────────────────────────────

const getPlans = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const plans = await MembershipPlan.find(filter).sort({ price: 1 });
    res.status(200).json({ success: true, data: plans, count: plans.length });
  } catch (error) {
    next(error);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });
    res.status(200).json({ success: true, message: 'Plan deactivated.' });
  } catch (error) {
    next(error);
  }
};

// ─── Member Memberships ──────────────────────────────────────────────────────

const getMemberships = async (req, res, next) => {
  try {
    const { page, limit, status, memberId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (req.user.role === 'member') {
      filter.memberId = req.user._id;
    } else if (memberId) {
      filter.memberId = memberId;
    }

    const result = await paginate(Membership, filter, {
      page,
      limit,
      sort: { startDate: -1 },
      populate: [
        { path: 'memberId', select: 'name email avatar' },
        { path: 'planId', select: 'name duration price classLimit' },
      ],
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const getMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id)
      .populate('memberId', 'name email')
      .populate('planId', 'name duration price classLimit');
    if (!membership) return res.status(404).json({ success: false, message: 'Membership not found.' });
    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};

const createMembership = async (req, res, next) => {
  try {
    const { memberId, planId, startDate, amount, status, notes } = req.body;
    const plan = await MembershipPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

    const start = new Date(startDate);
    const end = new Date(start.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    const membership = await Membership.create({
      memberId,
      planId,
      startDate: start,
      endDate: end,
      amount: amount ?? plan.price,
      status: status || 'active',
      notes,
    });

    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};

const updateMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!membership) return res.status(404).json({ success: false, message: 'Membership not found.' });
    res.status(200).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};

// ─── Payments ────────────────────────────────────────────────────────────────

const getPayments = async (req, res, next) => {
  try {
    const { page, limit, status, memberId, paymentMethod, dateFrom, dateTo, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (req.user.role === 'member') {
      filter.memberId = req.user._id;
    } else if (memberId) {
      filter.memberId = memberId;
    }
    if (dateFrom || dateTo) {
      filter.paymentDate = {};
      if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) filter.paymentDate.$lte = new Date(dateTo);
    }
    if (search) {
      filter.transactionReference = { $regex: search, $options: 'i' };
    }

    const result = await paginate(Payment, filter, {
      page,
      limit,
      sort: { paymentDate: -1 },
      populate: [
        { path: 'memberId', select: 'name email' },
        { path: 'membershipId', select: 'planId startDate endDate' },
      ],
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const payment = await Payment.create({ ...req.body, recordedBy: req.user._id });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans, createPlan, updatePlan, deletePlan,
  getMemberships, getMembership, createMembership, updateMembership,
  getPayments, createPayment, updatePayment,
};
