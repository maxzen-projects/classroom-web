const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Chapter must belong to a subject']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  title: {
    type: String,
    required: [true, 'Please add a chapter title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    default: []
  }],
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
chapterSchema.index({ subjectId: 1 });
chapterSchema.index({ classId: 1 });
chapterSchema.index({ order: 1 });

// Virtual for lesson count
chapterSchema.virtual('lessonCount').get(function() {
  return Array.isArray(this.lessons) ? this.lessons.length : 0;
});

// Pre-save middleware to set order if not provided
chapterSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    try {
      const Chapter = mongoose.model('Chapter');
      const lastChapter = await Chapter.findOne({ subjectId: this.subjectId })
        .sort({ order: -1 });
      this.order = lastChapter ? lastChapter.order + 1 : 1;
    } catch (error) {
      console.error('Error setting chapter order:', error);
    }
  }
  next();
});

// Static method to find chapters by subject
chapterSchema.statics.findBySubject = function(subjectId) {
  return this.find({ subjectId, isActive: true }).sort({ order: 1 });
};

module.exports = mongoose.model('Chapter', chapterSchema);
