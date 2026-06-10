const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
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
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
      index: true,
    },
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be HH:mm'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be HH:mm'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const minutesFromTime = (value) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

timetableSchema.index({ classId: 1, dayOfWeek: 1, periodNumber: 1 }, { unique: true });
timetableSchema.index({ teacherId: 1, dayOfWeek: 1, startTime: 1 });

timetableSchema.pre('validate', function validateTimes(next) {
  if (this.startTime && this.endTime && minutesFromTime(this.startTime) >= minutesFromTime(this.endTime)) {
    this.invalidate('endTime', 'End time must be after start time.');
  }
  next();
});

module.exports = mongoose.model('Timetable', timetableSchema);
