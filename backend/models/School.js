const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a school name'],
    trim: true,
    unique: true,
    maxlength: [100, 'School name cannot exceed 100 characters']
  },
  logo: {
    type: String,
    default: ''
  },
  code: {
    type: String,
    required: [true, 'Please add a school code'],
    trim: true,
    unique: true,
    maxlength: [50, 'School code cannot exceed 50 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'standard', 'premium'],
    default: 'standard'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  state: {
    type: String,
    trim: true,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

schoolSchema.index({ code: 1 });
schoolSchema.index({ status: 1 });

schoolSchema.pre('validate', function(next) {
  if (this.createdBy && !this.admin) {
    this.admin = this.createdBy;
  }
  if (this.admin && !this.createdBy) {
    this.createdBy = this.admin;
  }
  next();
});

module.exports = mongoose.model('School', schoolSchema);
