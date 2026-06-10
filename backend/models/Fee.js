const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'bank_transfer'],
      required: true
    },
    transactionId: String,
    remarks: String,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for student fee per academic year
feeSchema.index({ studentId: 1, classId: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Fee', feeSchema);
