const User = require('../models/User');
const YogaClass = require('../models/YogaClass');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const Membership = require('../models/Membership');
const Payment = require('../models/Payment');

// ─── Admin Dashboard KPIs ────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalMembers,
      activeMembers,
      classesToday,
      bookingsToday,
      monthlyRevenue,
      weeklyBookings,
      membershipStatusBreakdown,
      classPopularity,
      recentBookings,
      expiringMemberships,
    ] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'member', status: 'active' }),
      YogaClass.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: 'cancelled' } }),
      Booking.countDocuments({ bookingDate: { $gte: startOfDay, $lte: endOfDay } }),

      // Monthly revenue
      Payment.aggregate([
        { $match: { paymentDate: { $gte: startOfMonth, $lte: endOfMonth }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),

      // Weekly bookings trend (last 7 days)
      Booking.aggregate([
        { $match: { bookingDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Membership status
      Membership.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // Top 5 most booked classes
      Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$classId', bookings: { $sum: 1 } } },
        { $sort: { bookings: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'yogaclasses',
            localField: '_id',
            foreignField: '_id',
            as: 'class',
          },
        },
        { $unwind: '$class' },
        { $project: { className: '$class.name', type: '$class.type', bookings: 1 } },
      ]),

      // Recent bookings
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('memberId', 'name email')
        .populate('classId', 'name date startTime'),

      // Expiring memberships in 7 days
      Membership.find({
        status: 'active',
        endDate: {
          $gte: now,
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
        .limit(10)
        .populate('memberId', 'name email')
        .populate('planId', 'name'),
    ]);

    // Occupancy rate
    const allScheduledClasses = await YogaClass.aggregate([
      { $match: { status: { $in: ['scheduled', 'completed'] } } },
      {
        $group: {
          _id: null,
          totalCapacity: { $sum: '$capacity' },
          totalBooked: { $sum: '$bookedCount' },
        },
      },
    ]);

    const occupancyRate =
      allScheduledClasses[0]?.totalCapacity > 0
        ? ((allScheduledClasses[0].totalBooked / allScheduledClasses[0].totalCapacity) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalMembers,
          activeMembers,
          classesToday,
          bookingsToday,
          monthlyRevenue: monthlyRevenue[0]?.total || 0,
          occupancyRate: parseFloat(occupancyRate),
        },
        weeklyBookings,
        membershipStatusBreakdown,
        classPopularity,
        recentBookings,
        expiringMemberships,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Attendance Report ────────────────────────────────────────────────────────
const getAttendanceReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, classId, instructorId } = req.query;
    const match = {};
    if (dateFrom || dateTo) {
      match.markedAt = {};
      if (dateFrom) match.markedAt.$gte = new Date(dateFrom);
      if (dateTo) match.markedAt.$lte = new Date(dateTo);
    }
    if (classId) match.classId = require('mongoose').Types.ObjectId.createFromHexString(classId);

    const [summary, byClass, byMember, monthly] = await Promise.all([
      Attendance.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Attendance.aggregate([
        { $match: match },
        { $group: { _id: { classId: '$classId', status: '$status' }, count: { $sum: 1 } } },
        { $lookup: { from: 'yogaclasses', localField: '_id.classId', foreignField: '_id', as: 'class' } },
        { $unwind: '$class' },
        { $group: { _id: '$class.name', stats: { $push: { status: '$_id.status', count: '$count' } } } },
        { $sort: { _id: 1 } },
      ]),

      Attendance.aggregate([
        { $match: { ...match, memberId: req.user.role === 'member' ? req.user._id : undefined } },
        { $group: { _id: '$memberId', present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }, }, total: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'member' } },
        { $unwind: '$member' },
        { $project: { name: '$member.name', email: '$member.email', present: 1, total: 1, rate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } },
        { $sort: { rate: -1 } },
        { $limit: 20 },
      ]),

      Attendance.aggregate([
        { $match: match },
        {
          $group: {
            _id: { year: { $year: '$markedAt' }, month: { $month: '$markedAt' } },
            present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    res.status(200).json({ success: true, data: { summary, byClass, byMember, monthly } });
  } catch (error) {
    next(error);
  }
};

// ─── Revenue Report ───────────────────────────────────────────────────────────
const getRevenueReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const match = { status: 'paid' };
    if (dateFrom || dateTo) {
      match.paymentDate = {};
      if (dateFrom) match.paymentDate.$gte = new Date(dateFrom);
      if (dateTo) match.paymentDate.$lte = new Date(dateTo);
    }

    const [monthly, byMethod, daily, total] = await Promise.all([
      Payment.aggregate([
        { $match: match },
        {
          $group: {
            _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      Payment.aggregate([
        { $match: match },
        { $group: { _id: '$paymentMethod', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
      ]),

      Payment.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),

      Payment.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({ success: true, data: { monthly, byMethod, daily, total: total[0] || { total: 0, count: 0 } } });
  } catch (error) {
    next(error);
  }
};

// ─── Membership Report ────────────────────────────────────────────────────────
const getMembershipReport = async (req, res, next) => {
  try {
    const now = new Date();

    const [statusBreakdown, expiringIn7, expiringIn30, newThisMonth, monthly] = await Promise.all([
      Membership.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Membership.countDocuments({
        status: 'active',
        endDate: { $gte: now, $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      }),

      Membership.countDocuments({
        status: 'active',
        endDate: { $gte: now, $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      }),

      Membership.countDocuments({
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
        },
      }),

      Membership.aggregate([
        {
          $group: {
            _id: { year: { $year: '$startDate' }, month: { $month: '$startDate' } },
            new: { $sum: 1 },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: { statusBreakdown, expiringIn7, expiringIn30, newThisMonth, monthly },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Class Performance Report ─────────────────────────────────────────────────
const getClassReport = async (req, res, next) => {
  try {
    const [classPerformance, mostBooked, leastBooked] = await Promise.all([
      Booking.aggregate([
        { $group: { _id: '$classId', totalBookings: { $sum: 1 }, cancellations: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } } } },
        { $lookup: { from: 'yogaclasses', localField: '_id', foreignField: '_id', as: 'class' } },
        { $unwind: '$class' },
        {
          $project: {
            className: '$class.name',
            type: '$class.type',
            capacity: '$class.capacity',
            totalBookings: 1,
            cancellations: 1,
            cancellationRate: { $multiply: [{ $divide: ['$cancellations', { $max: ['$totalBookings', 1] }] }, 100] },
            occupancyRate: { $multiply: [{ $divide: ['$totalBookings', { $max: ['$class.capacity', 1] }] }, 100] },
          },
        },
        { $sort: { totalBookings: -1 } },
      ]),

      Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$classId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'yogaclasses', localField: '_id', foreignField: '_id', as: 'class' } },
        { $unwind: '$class' },
        { $project: { name: '$class.name', type: '$class.type', count: 1 } },
      ]),

      Booking.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: '$classId', count: { $sum: 1 } } },
        { $sort: { count: 1 } },
        { $limit: 5 },
        { $lookup: { from: 'yogaclasses', localField: '_id', foreignField: '_id', as: 'class' } },
        { $unwind: '$class' },
        { $project: { name: '$class.name', type: '$class.type', count: 1 } },
      ]),
    ]);

    res.status(200).json({ success: true, data: { classPerformance, mostBooked, leastBooked } });
  } catch (error) {
    next(error);
  }
};

// ─── Member Growth Report ─────────────────────────────────────────────────────
const getMemberGrowthReport = async (req, res, next) => {
  try {
    const [monthly, activeVsInactive] = await Promise.all([
      User.aggregate([
        { $match: { role: 'member' } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            newMembers: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      User.aggregate([
        { $match: { role: 'member' } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({ success: true, data: { monthly, activeVsInactive } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAttendanceReport,
  getRevenueReport,
  getMembershipReport,
  getClassReport,
  getMemberGrowthReport,
};
