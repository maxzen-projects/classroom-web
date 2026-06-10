const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null // null means school-wide, or specific class
  },
  feeType: {
    type: String,
    enum: ['tuition', 'recurring', 'extra'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
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
    enum: ['monthly', 'quarterly', 'annual', 'one-time'],
    default: 'monthly'
  },
  dueDay: {
    type: Number,
    min: [1, 'Due day must be between 1 and 31'],
    max: [31, 'Due day must be between 1 and 31'],
    default: 15
  },
  lateFeeAmount: {
    type: Number,
    min: [0, 'Late fee cannot be negative'],
    default: 0
  },
  lateFeePercentage: {
    type: Number,
    min: [0, 'Late fee percentage cannot be negative'],
    max: [100, 'Late fee percentage cannot exceed 100'],
    default: 0
  },
  carryForwardDue: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  appliesTo: {
    type: String,
    enum: ['all_students', 'specific_class', 'custom'],
    default: 'all_students'
  },
  appliedToClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
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
  }
}, {
  timestamps: true
});

// Indexes for performance
feeStructureSchema.index({ schoolId: 1, isActive: 1 });
feeStructureSchema.index({ schoolId: 1, classId: 1 });
feeStructureSchema.index({ feeType: 1, isActive: 1 });

// Validate late fee configuration
feeStructureSchema.pre('save', function(next) {
  if (this.lateFeeAmount === 0 && this.lateFeePercentage === 0) {
    this.lateFeeAmount = 0;
  }
  next();
});

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
