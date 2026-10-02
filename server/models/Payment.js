const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Member is required'],
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      required: [true, 'Membership is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Bank Transfer'],
      required: [true, 'Payment method is required'],
    },
    transactionReference: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction reference cannot exceed 100 characters'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'refunded'],
      default: 'paid',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

paymentSchema.index({ memberId: 1 });
paymentSchema.index({ membershipId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
