const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    default: null
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    default: null
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Live class must have a teacher']
  },
  title: {
    type: String,
    required: [true, 'Please add a class title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled time is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  meetingUrl: {
    type: String,
    default: null
  },
  platform: {
    type: String,
    enum: ['zoom', 'google_meet', 'microsoft_teams', 'custom'],
    default: 'zoom'
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  attendance: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['joined', 'left'],
      default: 'joined'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

liveClassSchema.virtual('meetingLink').get(function meetingLink() {
  return this.meetingUrl;
});

liveClassSchema.index({ classId: 1 });
liveClassSchema.index({ subjectId: 1 });
liveClassSchema.index({ teacherId: 1 });
liveClassSchema.index({ schoolId: 1 });
liveClassSchema.index({ scheduledAt: 1 });
liveClassSchema.index({ status: 1 });
liveClassSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model('LiveClass', liveClassSchema);
