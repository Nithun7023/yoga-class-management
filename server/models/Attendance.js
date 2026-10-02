const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
      unique: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Member is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'YogaClass',
      required: [true, 'Class is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'cancelled'],
      required: [true, 'Attendance status is required'],
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Marker is required'],
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ memberId: 1 });
attendanceSchema.index({ classId: 1 });
attendanceSchema.index({ bookingId: 1 }, { unique: true });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ markedAt: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
