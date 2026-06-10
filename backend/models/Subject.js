const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School is required']
  },
  name: {
    type: String,
    required: [true, 'Please add a subject name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
subjectSchema.index({ schoolId: 1 });
subjectSchema.index({ name: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);