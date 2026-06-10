const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'],
    trim: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    maxlength: [10, 'Section cannot exceed 10 characters']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
    match: [/^\d{4}-\d{2}$/, 'Academic year must be in format YYYY-YY (e.g., 2025-26)']
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  feeAmount: {
    type: Number,
    required: [true, 'Fee amount is required for the class'],
    min: [0, 'Fee amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique class per school
classSchema.index({ name: 1, section: 1, academicYear: 1, school: 1 }, { unique: true });

classSchema.pre('validate', function(next) {
  if (this.schoolId && !this.school) {
    this.school = this.schoolId;
  }
  if (this.school && !this.schoolId) {
    this.schoolId = this.school;
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);