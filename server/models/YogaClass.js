const mongoose = require('mongoose');

const yogaClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      maxlength: [150, 'Class name cannot exceed 150 characters'],
    },
    type: {
      type: String,
      required: [true, 'Yoga type is required'],
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
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    focusArea: [
      {
        type: String,
        enum: ['Flexibility', 'Strength', 'Mobility', 'Relaxation', 'Stress Relief', 'Balance', 'Core'],
      },
    ],
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    room: {
      type: String,
      trim: true,
      maxlength: [100, 'Room name cannot exceed 100 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Class date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'],
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity cannot exceed 500'],
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDays: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ],
    image: {
      type: String,
      default: null,
    },
    tags: [String],
  },
  { timestamps: true }
);

// Indexes
yogaClassSchema.index({ instructorId: 1 });
yogaClassSchema.index({ date: 1 });
yogaClassSchema.index({ status: 1 });
yogaClassSchema.index({ type: 1 });
yogaClassSchema.index({ difficulty: 1 });
yogaClassSchema.index({ name: 'text', description: 'text' });

// Virtual: available slots
yogaClassSchema.virtual('availableSlots').get(function () {
  return this.capacity - this.bookedCount;
});

// Virtual: isFull
yogaClassSchema.virtual('isFull').get(function () {
  return this.bookedCount >= this.capacity;
});

// Validate endTime > startTime
yogaClassSchema.pre('validate', function (next) {
  if (this.startTime && this.endTime) {
    const [sh, sm] = this.startTime.split(':').map(Number);
    const [eh, em] = this.endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    if (endMinutes <= startMinutes) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

yogaClassSchema.set('toJSON', { virtuals: true });
yogaClassSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('YogaClass', yogaClassSchema);
