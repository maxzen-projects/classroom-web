const mongoose = require('mongoose');

const extraFeeSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    enum: ['transport', 'books', 'uniform', 'hostel', 'exam_fee', 'activity', 'other']
  },
  description: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  frequency: {
    type: String,
    enum: ['one-time', 'monthly', 'quarterly', 'annual'],
    default: 'monthly'
  },
  dueDay: {
    type: Number,
    min: [1, 'Due day must be between 1 and 31'],
    max: [31, 'Due day must be between 1 and 31'],
    default: 15
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Applied to specific classes
  appliedToClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  // Applied to specific students (for custom charges)
  appliedToStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
extraFeeSchema.index({ schoolId: 1, isActive: 1 });
extraFeeSchema.index({ schoolId: 1, name: 1 });
extraFeeSchema.index({ appliedToClasses: 1 });
extraFeeSchema.index({ appliedToStudents: 1 });

module.exports = mongoose.model('ExtraFee', extraFeeSchema);
