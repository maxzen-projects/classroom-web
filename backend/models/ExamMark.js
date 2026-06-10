const mongoose = require('mongoose');

const examMarkSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExternalExam',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gradedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

examMarkSchema.index({ examId: 1, studentId: 1 }, { unique: true });
examMarkSchema.index({ studentId: 1, createdAt: -1 });
examMarkSchema.index({ schoolId: 1, createdAt: -1 });

module.exports = mongoose.model('ExamMark', examMarkSchema);
