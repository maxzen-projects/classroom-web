const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      default: '',
    },
    marksAwarded: {
      type: Number,
      default: null,
      min: 0,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'auto-submitted'],
      default: 'in-progress',
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    totalMarks: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });
submissionSchema.index({ assignmentId: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
