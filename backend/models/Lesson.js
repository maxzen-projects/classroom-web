const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: [true, 'Lesson must belong to a chapter']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  title: {
    type: String,
    required: [true, 'Please add a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify lesson type'],
    enum: ['video', 'note']
  },
  videoUrl: {
    type: String,
    default: null
  },
  fileUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
lessonSchema.index({ chapterId: 1 });
lessonSchema.index({ createdBy: 1 });
lessonSchema.index({ type: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);