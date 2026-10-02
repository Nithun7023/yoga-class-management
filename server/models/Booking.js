const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
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
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'waitlisted', 'completed'],
      default: 'confirmed',
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// Unique: a member cannot book the same class twice
bookingSchema.index({ memberId: 1, classId: 1 }, { unique: true });
bookingSchema.index({ memberId: 1 });
bookingSchema.index({ classId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
