const mongoose = require('mongoose');

const studentBillSchema = new mongoose.Schema({
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
  // Bill identification
  billMonth: {
    type: Number,
    required: true, // 1-12
    min: 1,
    max: 12
  },
  billYear: {
    type: Number,
    required: true
  },
  billNumber: {
    type: String,
    unique: true,
    required: true // Format: SCHOOL-YYYY-MM-STUDENTID
  },
  // Bill components
  tuitionFee: {
    type: Number,
    default: 0,
    min: [0, 'Tuition fee cannot be negative']
  },
  previousDue: {
    type: Number,
    default: 0,
    min: [0, 'Previous due cannot be negative']
  },
  extraFees: [{
    feeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExtraFee',
      required: true
    },
    name: String,
    amount: {
      type: Number,
      min: 0
    }
  }],
  lateFee: {
    type: Number,
    default: 0,
    min: [0, 'Late fee cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  dueAmount: {
    type: Number,
    required: true,
    min: [0, 'Due amount cannot be negative']
  },
  // Due dates
  dueDate: {
    type: Date,
    required: true
  },
  gracePeriodEndDate: {
    type: Date,
    default: null
  },
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'generated', 'unpaid', 'partially_paid', 'paid', 'overdue'],
    default: 'draft'
  },
  // Late fee tracking
  isLateFeesApplied: {
    type: Boolean,
    default: false
  },
  lateFeeAppliedDate: {
    type: Date,
    default: null
  },
  // Carry forward tracking
  isCarriedForward: {
    type: Boolean,
    default: false
  },
  carriedFromBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentBill',
    default: null
  },
  // Additional metadata
  notes: {
    type: String,
    default: ''
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  generatedAutomatically: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate bills
studentBillSchema.index({ studentId: 1, schoolId: 1, billMonth: 1, billYear: 1 }, { unique: true });

// Indexes for common queries
studentBillSchema.index({ schoolId: 1, billMonth: 1, billYear: 1 });
studentBillSchema.index({ studentId: 1, status: 1 });
studentBillSchema.index({ dueDate: 1, status: 1 });
studentBillSchema.index({ billNumber: 1 });

// Virtual for bill period display
studentBillSchema.virtual('billPeriod').get(function() {
  const monthName = new Date(this.billYear, this.billMonth - 1).toLocaleString('default', { month: 'long' });
  return `${monthName} ${this.billYear}`;
});

// Pre-save hook to recalculate totals and generate bill number
studentBillSchema.pre('save', async function(next) {
  try {
    // Recalculate totals
    this.totalAmount = this.tuitionFee + this.previousDue + (this.lateFee || 0);
    
    if (this.extraFees && this.extraFees.length > 0) {
      this.totalAmount += this.extraFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    }

    this.dueAmount = Math.max(0, this.totalAmount - this.paidAmount);

    // Update status based on payment
    if (this.dueAmount === 0) {
      this.status = 'paid';
    } else if (this.paidAmount > 0) {
      this.status = 'partially_paid';
    } else if (this.status === 'draft') {
      this.status = 'generated';
    }

    // Generate bill number if not set
    if (!this.billNumber) {
      const school = await mongoose.model('School').findById(this.schoolId);
      const monthStr = String(this.billMonth).padStart(2, '0');
      const studentStr = String(this.studentId).slice(-4).toUpperCase();
      this.billNumber = `${school?.code || 'SCH'}-${this.billYear}-${monthStr}-${studentStr}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('StudentBill', studentBillSchema);
