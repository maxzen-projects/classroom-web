const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'qa'],
      required: true,
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator(options) {
          if (this.type === 'mcq') {
            return Array.isArray(options) && options.filter(Boolean).length >= 2;
          }
          return !options || options.length === 0;
        },
        message: 'MCQ questions need at least two options; Q&A questions cannot have options.',
      },
    },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['mcq', 'qa', 'mixed'],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute'],
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: [1, 'Total marks must be greater than zero'],
    },
    numberOfQuestions: {
      type: Number,
      required: true,
      min: [1, 'At least one question is required'],
    },
    marksPerQuestion: {
      type: Number,
      required: true,
      min: 0,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator(questions) {
          return Array.isArray(questions) && questions.length === this.numberOfQuestions;
        },
        message: 'Question count must match numberOfQuestions.',
      },
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
  },
  { timestamps: true }
);

assignmentSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    this.invalidate('endTime', 'End time must be after start time.');
  }

  if (this.totalMarks && this.numberOfQuestions) {
    if (!Number.isInteger(this.totalMarks)) {
      this.invalidate('totalMarks', 'Total marks must be a whole number.');
    } else if (!Number.isInteger(this.numberOfQuestions) || this.totalMarks % this.numberOfQuestions !== 0) {
      this.invalidate('totalMarks', 'Total marks must divide equally across all questions.');
    } else {
      // this.marksPerQuestion = this.totalMarks / this.numberOfQuestions;
      const value = this.totalMarks / this.numberOfQuestions;
this.marksPerQuestion = Math.round(value); // or toFixed(2)
    }
  }

  if (Array.isArray(this.questions)) {
    const hasInvalidType = this.questions.some((question) => {
      if (this.type === 'mixed') return false;
      return question.type !== this.type;
    });

    if (hasInvalidType) {
      this.invalidate('questions', 'Question types must match the assignment type unless assignment type is mixed.');
    }
  }

  next();
});

assignmentSchema.index({ teacherId: 1, createdAt: -1 });
assignmentSchema.index({ classId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
