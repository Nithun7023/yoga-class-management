const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const { paginate } = require('../utils/pagination');

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Admin | Instructor (their classes) | Member (own)
const getAttendance = async (req, res, next) => {
  try {
    const { page, limit, status, classId, memberId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (classId) filter.classId = classId;

    if (req.user.role === 'member') {
      filter.memberId = req.user._id;
    } else if (memberId) {
      filter.memberId = memberId;
    }

    const result = await paginate(Attendance, filter, {
      page,
      limit,
      sort: { markedAt: -1 },
      populate: [
        { path: 'memberId', select: 'name email avatar' },
        { path: 'classId', select: 'name type date startTime' },
        { path: 'markedBy', select: 'name' },
        { path: 'bookingId', select: 'status' },
      ],
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance for a booking
// @route   POST /api/attendance
// @access  Instructor | Admin
const markAttendance = async (req, res, next) => {
  try {
    const { bookingId, status, notes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot mark attendance for a cancelled booking.' });
    }

    // Upsert: update if exists, create otherwise
    const attendance = await Attendance.findOneAndUpdate(
      { bookingId },
      {
        bookingId,
        memberId: booking.memberId,
        classId: booking.classId,
        status,
        markedBy: req.user._id,
        markedAt: Date.now(),
        notes,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk mark attendance for a class
// @route   POST /api/attendance/bulk
// @access  Instructor | Admin
const bulkMarkAttendance = async (req, res, next) => {
  try {
    const { classId, records } = req.body;
    // records: [{ bookingId, status, notes }]

    const ops = records.map(({ bookingId, status, notes }) => ({
      updateOne: {
        filter: { bookingId },
        update: {
          $set: {
            classId,
            status,
            notes,
            markedBy: req.user._id,
            markedAt: new Date(),
          },
          $setOnInsert: {
            bookingId,
            memberId: null, // populated from booking below
          },
        },
        upsert: true,
      },
    }));

    // Fetch bookings to get memberId
    const bookingIds = records.map((r) => r.bookingId);
    const bookings = await Booking.find({ _id: { $in: bookingIds } });
    const bookingMap = Object.fromEntries(bookings.map((b) => [b._id.toString(), b]));

    const attendanceRecords = records.map(({ bookingId, status, notes }) => ({
      updateOne: {
        filter: { bookingId },
        update: {
          bookingId,
          memberId: bookingMap[bookingId]?.memberId,
          classId,
          status,
          notes,
          markedBy: req.user._id,
          markedAt: new Date(),
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(attendanceRecords);

    res.status(200).json({ success: true, message: `Marked attendance for ${records.length} bookings.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance roster for a class (Instructor view)
// @route   GET /api/attendance/class/:classId
// @access  Instructor | Admin
const getClassRoster = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const bookings = await Booking.find({ classId, status: { $ne: 'cancelled' } })
      .populate('memberId', 'name email avatar phone')
      .lean();

    const attendanceRecords = await Attendance.find({ classId }).lean();
    const attendanceMap = Object.fromEntries(
      attendanceRecords.map((a) => [a.bookingId.toString(), a])
    );

    const roster = bookings.map((b) => ({
      booking: b,
      attendance: attendanceMap[b._id.toString()] || null,
    }));

    res.status(200).json({ success: true, data: roster, count: roster.length });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAttendance, markAttendance, bulkMarkAttendance, getClassRoster };
