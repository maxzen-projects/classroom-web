const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  method: {
    type: String,
    enum: ['manual', 'camera', 'bulk', 'bulk-update'],
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Remove the problematic compound unique index and let MongoDB auto-generate
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });

attendanceSchema.pre('validate', function(next) {
  if (this.date) {
    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
