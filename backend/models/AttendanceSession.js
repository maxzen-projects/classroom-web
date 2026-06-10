const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSessionSchema.index({ classId: 1, date: 1 }, { unique: true });

attendanceSessionSchema.pre('validate', function normalizeSession(next) {
  if (this.date) {
    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
  }

  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    return next(new Error('Session start time must be before end time'));
  }

  next();
});

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
