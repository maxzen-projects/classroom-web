const FeeStructure = require('../models/FeeStructure');
const ExtraFee = require('../models/ExtraFee');
const StudentBill = require('../models/StudentBill');
const Payment = require('../models/Payment');
const { getBillingAnalytics } = require('../utils/billingService');
const mongoose = require('mongoose');

const getSchoolId = (user) => user.school || user.schoolId;

// ==================== FEE STRUCTURE CONTROLLERS ====================

const createFeeStructure = async (req, res) => {
  try {
    const { feeType, name, amount, frequency, dueDay, lateFeeAmount, lateFeePercentage, isActive, appliesTo, classId } = req.body;
    const schoolId = getSchoolId(req.user);

    if (!name || !feeType || amount === undefined) {
      return res.status(400).json({ message: 'Required fields: name, feeType, amount' });
    }

    const feeStructure = new FeeStructure({
      schoolId,
      classId: classId || null,
      feeType,
      name,
      amount,
      frequency: frequency || 'monthly',
      dueDay: dueDay || 15,
      lateFeeAmount: lateFeeAmount || 0,
      lateFeePercentage: lateFeePercentage || 0,
      isActive: isActive !== false,
      appliesTo: appliesTo || 'all_students',
      createdBy: req.user._id
    });

    await feeStructure.save();
    res.status(201).json({ message: 'Fee structure created successfully', feeStructure });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeeStructures = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { classId, feeType, isActive } = req.query;

    const query = { schoolId };
    if (classId) query.classId = classId;
    if (feeType) query.feeType = feeType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const feeStructures = await FeeStructure.find(query)
      .populate('classId', 'name section')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(feeStructures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeeStructureById = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findOne({
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    }).populate('classId createdBy');

    if (!feeStructure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    res.json(feeStructure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFeeStructure = async (req, res) => {
  try {
    const { name, amount, dueDay, lateFeeAmount, lateFeePercentage, isActive } = req.body;
    
    const feeStructure = await FeeStructure.findOne({
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    });

    if (!feeStructure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    if (name) feeStructure.name = name;
    if (amount !== undefined) feeStructure.amount = amount;
    if (dueDay) feeStructure.dueDay = dueDay;
    if (lateFeeAmount !== undefined) feeStructure.lateFeeAmount = lateFeeAmount;
    if (lateFeePercentage !== undefined) feeStructure.lateFeePercentage = lateFeePercentage;
    if (isActive !== undefined) feeStructure.isActive = isActive;
    
    feeStructure.updatedBy = req.user._id;
    await feeStructure.save();

    res.json({ message: 'Fee structure updated successfully', feeStructure });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findOneAndDelete({
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    });

    if (!feeStructure) {
      return res.status(404).json({ message: 'Fee structure not found' });
    }

    res.json({ message: 'Fee structure deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== EXTRA FEE CONTROLLERS ====================

const createExtraFee = async (req, res) => {
  try {
    const { name, description, amount, frequency, dueDay, appliedToClasses, appliedToStudents } = req.body;
    const schoolId = getSchoolId(req.user);

    if (!name || !amount) {
      return res.status(400).json({ message: 'Required fields: name, amount' });
    }

    const extraFee = new ExtraFee({
      schoolId,
      name,
      description: description || '',
      amount,
      frequency: frequency || 'monthly',
      dueDay: dueDay || 15,
      appliedToClasses: appliedToClasses || [],
      appliedToStudents: appliedToStudents || [],
      createdBy: req.user._id,
      isActive: true
    });

    await extraFee.save();
    res.status(201).json({ message: 'Extra fee created successfully', extraFee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExtraFees = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { name, isActive } = req.query;

    const query = { schoolId };
    if (name) query.name = name;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const extraFees = await ExtraFee.find(query)
      .populate('appliedToClasses', 'name section')
      .populate('appliedToStudents', 'name rollNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(extraFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExtraFee = async (req, res) => {
  try {
    const { name, description, amount, frequency, dueDay, appliedToClasses, appliedToStudents, isActive } = req.body;

    const extraFee = await ExtraFee.findOne({
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    });

    if (!extraFee) {
      return res.status(404).json({ message: 'Extra fee not found' });
    }

    if (name) extraFee.name = name;
    if (description !== undefined) extraFee.description = description;
    if (amount !== undefined) extraFee.amount = amount;
    if (frequency) extraFee.frequency = frequency;
    if (dueDay) extraFee.dueDay = dueDay;
    if (appliedToClasses) extraFee.appliedToClasses = appliedToClasses;
    if (appliedToStudents) extraFee.appliedToStudents = appliedToStudents;
    if (isActive !== undefined) extraFee.isActive = isActive;

    extraFee.updatedBy = req.user._id;
    await extraFee.save();

    res.json({ message: 'Extra fee updated successfully', extraFee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExtraFee = async (req, res) => {
  try {
    const extraFee = await ExtraFee.findOneAndDelete({
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    });

    if (!extraFee) {
      return res.status(404).json({ message: 'Extra fee not found' });
    }

    res.json({ message: 'Extra fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== STUDENT BILL CONTROLLERS ====================

const getStudentBills = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { studentId, classId, status, billMonth, billYear, page = 1, limit = 20 } = req.query;

    const query = { schoolId };

    // Role-based filtering
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'teacher') {
      if (classId) query.classId = classId;
    } else if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      if (studentId) query.studentId = studentId;
      if (classId) query.classId = classId;
    }

    if (status) query.status = status;
    if (billMonth) query.billMonth = parseInt(billMonth);
    if (billYear) query.billYear = parseInt(billYear);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bills = await StudentBill.find(query)
      .populate('studentId', 'name rollNumber email')
      .populate('classId', 'name section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StudentBill.countDocuments(query);

    res.json({
      bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBillById = async (req, res) => {
  try {
    const bill = await StudentBill.findOne({
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    })
      .populate('studentId', 'name rollNumber email')
      .populate('classId', 'name section')
      .populate('extraFees.feeId');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check access permissions
    if (req.user.role === 'student' && bill.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBill = async (req, res) => {
  try {
    const { tuitionFee, extraFees, notes } = req.body;

    const bill = await StudentBill.findOne({
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    });

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (tuitionFee !== undefined) bill.tuitionFee = tuitionFee;
    if (extraFees) bill.extraFees = extraFees;
    if (notes !== undefined) bill.notes = notes;

    bill.lastModifiedBy = req.user._id;
    await bill.save();

    res.json({ message: 'Bill updated successfully', bill });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PAYMENT CONTROLLERS ====================

const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, referenceNumber, remarks } = req.body;
    const billId = req.params.billId;
    const schoolId = getSchoolId(req.user);

    // Validate bill exists
    const bill = await StudentBill.findOne({ _id: billId, schoolId });
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Validate student access (for students)
    if (req.user.role === 'student' && bill.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than zero' });
    }
    if (amount > bill.dueAmount) {
      return res.status(400).json({ message: `Payment exceeds due amount. Due: ${bill.dueAmount}, Provided: ${amount}` });
    }

    // Create payment
    const payment = new Payment({
      studentId: bill.studentId,
      billId,
      schoolId,
      amount,
      paymentMethod,
      transactionId: transactionId || null,
      referenceNumber: referenceNumber || null,
      remarks: remarks || '',
      receivedBy: req.user.role !== 'student' ? req.user._id : null,
      status: 'completed',
      previousBalance: bill.dueAmount,
      newBalance: bill.dueAmount - amount
    });

    await payment.save();

    // Update bill
    bill.paidAmount += amount;
    bill.dueAmount -= amount;
    
    if (bill.dueAmount === 0) {
      bill.status = 'paid';
    } else if (bill.paidAmount > 0) {
      bill.status = 'partially_paid';
    }

    await bill.save();

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
      bill
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { billId, studentId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { schoolId };

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (studentId) {
      query.studentId = studentId;
    }

    if (billId) query.billId = billId;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate('studentId', 'name rollNumber')
      .populate('billId', 'billNumber billMonth billYear')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ANALYTICS CONTROLLERS ====================

const getBillingDashboard = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate = new Date() } = req.query;

    const result = await getBillingAnalytics(schoolId, new Date(startDate), new Date(endDate));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingDues = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { classId, limit = 20 } = req.query;

    const query = {
      schoolId,
      status: { $in: ['unpaid', 'partially_paid', 'overdue'] },
      dueAmount: { $gt: 0 }
    };

    if (classId) query.classId = classId;

    const pendingBills = await StudentBill.find(query)
      .populate('studentId', 'name rollNumber email')
      .populate('classId', 'name section')
      .sort({ dueDate: 1, dueAmount: -1 })
      .limit(parseInt(limit));

    const totalDue = await StudentBill.collection.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$dueAmount' } } }
    ]);

    res.json({
      pendingBills,
      totalDue: totalDue[0]?.total || 0,
      count: pendingBills.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLateFeesReport = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { limit = 20 } = req.query;

    const billsWithLateFees = await StudentBill.find({
      schoolId,
      lateFee: { $gt: 0 }
    })
      .populate('studentId', 'name rollNumber email')
      .populate('classId', 'name section')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalLateFees = await StudentBill.aggregate([
      { $match: { schoolId, lateFee: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$lateFee' } } }
    ]);

    res.json({
      billsWithLateFees,
      totalLateFees: totalLateFees[0]?.total || 0,
      count: billsWithLateFees.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  // Fee Structures
  createFeeStructure,
  getFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
  // Extra Fees
  createExtraFee,
  getExtraFees,
  updateExtraFee,
  deleteExtraFee,
  // Bills
  getStudentBills,
  getBillById,
  updateBill,
  // Payments
  recordPayment,
  getPaymentHistory,
  // Analytics
  getBillingDashboard,
  getPendingDues,
  getLateFeesReport
};
