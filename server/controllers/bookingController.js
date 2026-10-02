const Booking = require('../models/Booking');
const YogaClass = require('../models/YogaClass');
const { paginate } = require('../utils/pagination');

// @desc    Get bookings
// @route   GET /api/bookings
// @access  Admin (all) | Instructor (their classes) | Member (own)
const getBookings = async (req, res, next) => {
  try {
    const { page, limit, status, classId, memberId, date, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (classId) filter.classId = classId;

    // Members only see their own bookings
    if (req.user.role === 'member') {
      filter.memberId = req.user._id;
    } else if (memberId) {
      filter.memberId = memberId;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.bookingDate = { $gte: start, $lte: end };
    }

    const result = await paginate(Booking, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'memberId', select: 'name email phone avatar' },
        { path: 'classId', select: 'name type date startTime endTime instructorId room' },
        { path: 'cancelledBy', select: 'name' },
      ],
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('memberId', 'name email')
      .populate('classId', 'name type date startTime endTime room capacity bookedCount');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Members can only view their own bookings
    if (req.user.role === 'member' && booking.memberId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking (with race-condition protection)
// @route   POST /api/bookings
// @access  Member | Admin
const createBooking = async (req, res, next) => {
  try {
    const memberId = req.user.role === 'admin' && req.body.memberId ? req.body.memberId : req.user._id;
    const { classId, notes } = req.body;

    // Atomically check capacity and increment — prevents race conditions
    const yogaClass = await YogaClass.findOneAndUpdate(
      {
        _id: classId,
        status: 'scheduled',
        $expr: { $lt: ['$bookedCount', '$capacity'] },
      },
      { $inc: { bookedCount: 1 } },
      { new: true }
    );

    if (!yogaClass) {
      // Distinguish between class not found, full, or not scheduled
      const cls = await YogaClass.findById(classId);
      if (!cls) return res.status(404).json({ success: false, message: 'Class not found.' });
      if (cls.status !== 'scheduled') {
        return res.status(400).json({ success: false, message: 'Class is not available for booking.' });
      }
      return res.status(400).json({ success: false, message: 'Class is full. No available slots.' });
    }

    try {
      const booking = await Booking.create({ memberId, classId, notes });
      const populated = await booking.populate([
        { path: 'memberId', select: 'name email' },
        { path: 'classId', select: 'name type date startTime room' },
      ]);
      res.status(201).json({ success: true, data: populated });
    } catch (err) {
      // Rollback the bookedCount increment on booking creation failure (e.g. duplicate)
      await YogaClass.findByIdAndUpdate(classId, { $inc: { bookedCount: -1 } });
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'You have already booked this class.' });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Member (own) | Admin
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (req.user.role === 'member' && booking.memberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancellationReason = req.body.cancellationReason || '';
    booking.cancelledBy = req.user._id;
    await booking.save();

    // Decrement class booked count
    await YogaClass.findByIdAndUpdate(booking.classId, { $inc: { bookedCount: -1 } });

    res.status(200).json({ success: true, data: booking, message: 'Booking cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBookings, getBooking, createBooking, cancelBooking };
