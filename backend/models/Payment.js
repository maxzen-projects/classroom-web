const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentBill',
    required: true
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'bank_transfer', 'cheque', 'other'],
    required: true
  },
  // For online payments
  transactionId: {
    type: String,
    default: null,
    sparse: true // Allow null values but keep unique constraint
  },
  // For offline payments
  referenceNumber: {
    type: String,
    default: null
  },
  // Payment gateway details (if applicable)
  paymentGateway: {
    type: String,
    default: null
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'completed'
  },
  // Admin notes
  remarks: {
    type: String,
    default: ''
  },
  // Who recorded this payment
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null if student paid via portal
  },
  // Receipt information
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptIssued: {
    type: Boolean,
    default: false
  },
  // For partial payments tracking
  previousBalance: {
    type: Number,
    default: 0
  },
  newBalance: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ studentId: 1, paymentDate: -1 });
paymentSchema.index({ billId: 1 });
paymentSchema.index({ schoolId: 1, paymentDate: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 }, { sparse: true });
paymentSchema.index({ receiptNumber: 1 }, { sparse: true });

// Pre-save hook to generate receipt number
paymentSchema.pre('save', async function(next) {
  try {
    if (!this.receiptNumber && this.status === 'completed') {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      this.receiptNumber = `RCP-${this.schoolId.toString().slice(-4).toUpperCase()}-${timestamp}-${random}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for display
paymentSchema.virtual('displayDate').get(function() {
  return this.paymentDate.toLocaleDateString();
});

module.exports = mongoose.model('Payment', paymentSchema);
