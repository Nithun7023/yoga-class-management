const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    specializations: [
      {
        type: String,
        enum: [
          'Hatha',
          'Vinyasa',
          'Ashtanga',
          'Yin',
          'Power Yoga',
          'Restorative',
          'Prenatal',
          'Meditation',
          'Beginner Yoga',
        ],
      },
    ],
    experience: {
      type: Number,
      min: 0,
      max: 50,
    },
    certifications: [
      {
        name: String,
        issuedBy: String,
        year: Number,
      },
    ],
    availability: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: String,
        endTime: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

instructorSchema.index({ userId: 1 }, { unique: true });
instructorSchema.index({ status: 1 });
instructorSchema.index({ specializations: 1 });

module.exports = mongoose.model('Instructor', instructorSchema);
