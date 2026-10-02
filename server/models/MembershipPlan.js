const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: [100, 'Plan name cannot exceed 100 characters'],
    },
    duration: {
      type: Number, // in days
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    classLimit: {
      type: Number, // null = unlimited
      default: null,
      min: [1, 'Class limit must be at least 1'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    features: [String],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

membershipPlanSchema.index({ status: 1 });

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
