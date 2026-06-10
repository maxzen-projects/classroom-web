const mongoose = require('mongoose');

// 📌 SubjectAssignment Schema
// Purpose: Maps subjects to classes with assigned teachers
// Structure: Class → Subjects → Teacher Assignment
const subjectAssignmentSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher assignment is required']
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Compound unique index to prevent duplicate subject assignments per class per school
subjectAssignmentSchema.index(
  { subjectId: 1, classId: 1, schoolId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      subjectId: { $type: 'objectId' },
      classId: { $type: 'objectId' },
      schoolId: { $type: 'objectId' }
    }
  }
);

// ✅ Indexes for better query performance
subjectAssignmentSchema.index({ schoolId: 1 });
subjectAssignmentSchema.index({ classId: 1 });
subjectAssignmentSchema.index({ teacherId: 1 });
subjectAssignmentSchema.index({ classId: 1, schoolId: 1 });

module.exports = mongoose.model('SubjectAssignment', subjectAssignmentSchema);