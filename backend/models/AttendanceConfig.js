const mongoose = require('mongoose');

const attendanceConfigSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      unique: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      default: '08:00',
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm format validation
    },
    endTime: {
      type: String,
      required: true,
      default: '12:00',
      match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm format validation
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validation hook to ensure startTime < endTime
attendanceConfigSchema.pre('validate', function validateTimes(next) {
  if (this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);

    const startInMinutes = startHour * 60 + startMin;
    const endInMinutes = endHour * 60 + endMin;

    if (startInMinutes >= endInMinutes) {
      return next(new Error('Attendance start time must be before end time'));
    }
  }
  next();
});

module.exports = mongoose.model('AttendanceConfig', attendanceConfigSchema);
