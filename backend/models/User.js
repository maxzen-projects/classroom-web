const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin', 'super_admin'],
    default: 'student'
  },
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  // Personal Information
  gender: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  address: {
    type: String,
    maxlength: [200, 'Address cannot be more than 200 characters'],
    default: ''
  },
  city: {
    type: String,
    maxlength: [50, 'City cannot be more than 50 characters'],
    default: ''
  },
  state: {
    type: String,
    maxlength: [50, 'State cannot be more than 50 characters'],
    default: ''
  },
  country: {
    type: String,
    maxlength: [50, 'Country cannot be more than 50 characters'],
    default: ''
  },
  pincode: {
    type: String,
    maxlength: [10, 'Pincode cannot be more than 10 characters'],
    default: ''
  },
  // Student specific fields
  parentName: {
    type: String,
    maxlength: [50, 'Parent name cannot be more than 50 characters'],
    default: ''
  },
  parentPhone: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number'],
    default: ''
  },
  rollNumber: {
    type: String,
    maxlength: [20, 'Roll number cannot be more than 20 characters'],
    default: ''
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  schoolCollege: {
    type: String,
    maxlength: [100, 'School/College name cannot be more than 100 characters'],
    default: ''
  },
  classStandard: {
    type: String,
    maxlength: [20, 'Class/Standard cannot be more than 20 characters'],
    default: ''
  },
  stream: {
    type: String,
    maxlength: [50, 'Stream cannot be more than 50 characters'],
    default: ''
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null
  },
  assignedSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  // Teacher specific fields
  qualification: {
    type: String,
    maxlength: [100, 'Qualification cannot be more than 100 characters'],
    default: ''
  },
  specialization: {
    type: String,
    maxlength: [100, 'Specialization cannot be more than 100 characters'],
    default: ''
  },
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  skills: [{
    type: String,
    maxlength: [50, 'Skill cannot be more than 50 characters']
  }],
  subjectsTeaching: [{
    type: String,
    maxlength: [50, 'Subject cannot be more than 50 characters']
  }],
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  certifications: [{
    type: String,
    maxlength: [100, 'Certification cannot be more than 100 characters']
  }],
  linkedin: {
    type: String,
    match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please add a valid LinkedIn URL'],
    default: ''
  },
  resume: {
    type: String,
    default: null
  },
  // Admin specific fields
  department: {
    type: String,
    maxlength: [50, 'Department cannot be more than 50 characters'],
    default: ''
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_content', 'view_analytics', 'manage_system'],
    default: []
  }],
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null
  },
  activityLogsCount: {
    type: Number,
    default: 0
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  recentActivities: [{
    type: {
      type: String,
      enum: ['lesson_completed', 'live_class_joined'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name (if needed)
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Pre-validate middleware to sync legacy class and school fields
userSchema.pre('validate', function(next) {
  if (this.classId && !this.class) {
    this.class = this.classId;
  }
  if (this.class && !this.classId) {
    this.classId = this.class;
  }
  if (this.schoolId && !this.school) {
    this.school = this.schoolId;
  }
  if (this.school && !this.schoolId) {
    this.schoolId = this.school;
  }
  next();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to get signed JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Instance method to get reset password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  delete userObject.emailVerificationToken;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
