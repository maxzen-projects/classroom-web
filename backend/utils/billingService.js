const StudentBill = require('../models/StudentBill');
const FeeStructure = require('../models/FeeStructure');
const ExtraFee = require('../models/ExtraFee');
const User = require('../models/User');
const Class = require('../models/Class');
const School = require('../models/School');
const mongoose = require('mongoose');

/**
 * Generate bills for a specific month
 * @param {Date} billDate - Date for which bills should be generated
 * @param {String} schoolId - Optional, specific school ID
 */
const generateMonthlyBills = async (billDate = new Date(), schoolId = null) => {
  try {
    const billMonth = billDate.getMonth() + 1; // 1-12
    const billYear = billDate.getFullYear();

    console.log(`[BILLING] Starting monthly bill generation for ${billMonth}/${billYear}`);

    // Build query for schools
    const schoolQuery = schoolId ? { _id: schoolId } : {};
    const schools = await School.find(schoolQuery);

    if (schools.length === 0) {
      console.log('[BILLING] No schools found');
      return { success: false, message: 'No schools found' };
    }

    let totalGenerated = 0;
    let totalFailed = 0;

    for (const school of schools) {
      try {
        console.log(`[BILLING] Processing school: ${school._id}`);

        // Get all active fee structures in this school
        const feeStructures = await FeeStructure.find({
          schoolId: school._id,
          isActive: true
        });

        console.log(`[BILLING] Found ${feeStructures.length} fee structures`);

        for (const feeStructure of feeStructures) {
          console.log(`[BILLING] Processing fee structure: ${feeStructure._id}, classId: ${feeStructure.classId}`);

          let students = [];
          let classData = null;
          let usingFallback = false;

          // 1. Primary: Try new architecture (users collection)
          const studentQuery = {
            role: 'student',
            isActive: true,
            schoolId: school._id
          };

          if (feeStructure.classId) {
            studentQuery.classId = feeStructure.classId;
          }

          students = await User.find(studentQuery);
          
          console.log(`[BILLING] Students Found (New Architecture): ${students.length}`);

          // 2. Fallback: If no students found, use old architecture (Class.students)
          if (students.length === 0 && feeStructure.classId) {
            console.log(`[BILLING] No students found with new architecture - using fallback to Class.students`);
            usingFallback = true;

            classData = await Class.findById(feeStructure.classId);
            if (classData && classData.students && classData.students.length > 0) {
              students = await User.find({
                _id: { $in: classData.students },
                role: 'student',
                $or: [
                  { accountStatus: 'active' },
                  { isActive: true }
                ]
              });
              console.log(`[BILLING] Students Found (Fallback/Old Architecture): ${students.length}`);
            }
          }

          if (students.length === 0) {
            console.log(`[BILLING] No students found for this fee structure - skipping`);
            continue;
          }

          // Get class data for fallback tuition fee if needed
          if (!classData && feeStructure.classId) {
            classData = await Class.findById(feeStructure.classId);
          }

          for (const student of students) {
            try {
              const result = await generateBillForStudent(
                student._id,
                student.classId || feeStructure.classId,
                school._id,
                billMonth,
                billYear,
                feeStructure,
                classData,
                usingFallback
              );
              if (result && !result.existing) {
                totalGenerated++;
              }
            } catch (error) {
              console.error(`[BILLING] Error generating bill for student ${student._id}:`, error.message);
              totalFailed++;
            }
          }
        }
      } catch (error) {
        console.error(`[BILLING] Error processing school ${school._id}:`, error.message);
      }
    }

    console.log(`[BILLING] Monthly bill generation completed. Generated: ${totalGenerated}, Failed: ${totalFailed}`);
    return { success: true, totalGenerated, totalFailed };
  } catch (error) {
    console.error('[BILLING] Error in generateMonthlyBills:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate bill for a single student
 */
const generateBillForStudent = async (studentId, classId, schoolId, billMonth, billYear, feeStructure, classData = null, usingFallback = false) => {
  // Validate required fields and ObjectIds
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error(`Invalid studentId: ${studentId}`);
  }
  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    throw new Error(`Invalid schoolId: ${schoolId}`);
  }
  if (classId && !mongoose.Types.ObjectId.isValid(classId)) {
    throw new Error(`Invalid classId: ${classId}`);
  }
  if (billMonth < 1 || billMonth > 12) {
    throw new Error(`Invalid month: ${billMonth}. Must be between 1-12`);
  }
  if (!billYear || billYear < 2000 || billYear > 2100) {
    throw new Error(`Invalid year: ${billYear}`);
  }

  // Check if bill already exists
  const existingBill = await StudentBill.findOne({
    studentId,
    schoolId,
    billMonth,
    billYear
  });

  if (existingBill) {
    console.log(`[BILLING] Skipping duplicate bill for student ${studentId} in ${billMonth}/${billYear}`);
    return { existing: true, bill: existingBill };
  }

  // Tuition fee with fallback: feeStructure.amount || classData.feeAmount
  const tuitionFee = feeStructure?.amount || classData?.feeAmount || 0;
  let extraFees = [];
  let previousDue = 0;

  console.log(`[BILLING] Creating Bill for student ${studentId}: tuitionFee = ${tuitionFee}, usingFallback = ${usingFallback}`);

  // Get extra fees applicable to this student/class
  const applicableExtraFees = await ExtraFee.find({
    schoolId,
    isActive: true,
    $or: [
      { appliedToClasses: classId },
      { appliedToStudents: studentId }
    ]
  });

  for (const extraFee of applicableExtraFees) {
    extraFees.push({
      feeId: extraFee._id,
      name: extraFee.name,
      amount: extraFee.amount
    });
  }

  // Check for previous month's unpaid due (carry forward)
  const previousMonth = billMonth === 1 ? 12 : billMonth - 1;
  const previousYear = billMonth === 1 ? billYear - 1 : billYear;

  const previousBill = await StudentBill.findOne({
    studentId,
    schoolId,
    billMonth: previousMonth,
    billYear: previousYear
  });

  let carriedFromBillId = null;
  let isCarriedForward = false;

  if (previousBill && previousBill.dueAmount > 0) {
    previousDue = previousBill.dueAmount;
    carriedFromBillId = previousBill._id;
    isCarriedForward = true;
  }

  // Calculate total amount
  const extraFeesTotal = extraFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalAmount = tuitionFee + previousDue + extraFeesTotal;

  // Determine due date
  const dueDay = feeStructure?.dueDay || classData?.dueDay || 15;
  const dueDate = new Date(billYear, billMonth - 1, dueDay);

  // Validate due date
  if (isNaN(dueDate.getTime())) {
    throw new Error(`Invalid due date: ${dueDate}`);
  }

  // Generate bill number manually to avoid validation errors
  const School = require('../models/School');
  const school = await School.findById(schoolId);
  const monthStr = String(billMonth).padStart(2, '0');
  const studentStr = String(studentId).slice(-4).toUpperCase();
  const billNumber = `${school?.code || 'SCH'}-${billYear}-${monthStr}-${studentStr}`;

  // Create bill data
  const billData = {
    studentId,
    classId,
    schoolId,
    billMonth,
    billYear,
    billNumber,
    billPeriod: `${billYear}-${String(billMonth).padStart(2, '0')}`,
    tuitionFee,
    previousDue,
    extraFees,
    totalAmount,
    dueAmount: totalAmount,
    paidAmount: 0,
    dueDate,
    status: 'generated',
    isCarriedForward,
    carriedFromBillId,
    generatedAutomatically: true
  };

  console.log(`[BILLING] Creating Bill with data:`, billData);

  try {
    // Create bill
    const bill = new StudentBill(billData);
    await bill.save();
    console.log(`[BILLING] Bill generated successfully for student ${studentId}: Bill #${bill.billNumber}`);
    return { existing: false, bill };
  } catch (error) {
    console.error('[BILLING] Bill Error:', error);
    throw error;
  }
};

/**
 * Apply late fees to overdue bills
 */
const applyLateFees = async (schoolId = null) => {
  try {
    console.log('[BILLING] Starting late fee application check');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find overdue bills without late fee applied
    const overdueBills = await StudentBill.find({
      dueDate: { $lt: today },
      isLateFeesApplied: false,
      status: { $in: ['unpaid', 'partially_paid', 'overdue'] },
      ...(schoolId && { schoolId })
    }).populate('schoolId');

    console.log(`[BILLING] Found ${overdueBills.length} overdue bills for late fee processing`);

    let totalApplied = 0;
    let totalFailed = 0;

    for (const bill of overdueBills) {
      try {
        // Get fee structure for late fee amount
        const feeStructure = await FeeStructure.findOne({
          schoolId: bill.schoolId._id,
          classId: bill.classId,
          feeType: 'tuition',
          isActive: true
        });

        if (feeStructure && (feeStructure.lateFeeAmount > 0 || feeStructure.lateFeePercentage > 0)) {
          let lateFeeAmount = 0;

          if (feeStructure.lateFeeAmount > 0) {
            lateFeeAmount = feeStructure.lateFeeAmount;
          } else if (feeStructure.lateFeePercentage > 0) {
            lateFeeAmount = Math.round((bill.dueAmount * feeStructure.lateFeePercentage) / 100);
          }

          if (lateFeeAmount > 0) {
            bill.lateFee = lateFeeAmount;
            bill.isLateFeesApplied = true;
            bill.lateFeeAppliedDate = new Date();
            bill.status = 'overdue';
            await bill.save();

            console.log(`[BILLING] Late fee applied to bill ${bill.billNumber}: ${lateFeeAmount}`);
            totalApplied++;
          }
        }
      } catch (error) {
        console.error(`[BILLING] Error applying late fee to bill ${bill._id}:`, error.message);
        totalFailed++;
      }
    }

    console.log(`[BILLING] Late fee application completed. Applied: ${totalApplied}, Failed: ${totalFailed}`);
    return { success: true, totalApplied, totalFailed };
  } catch (error) {
    console.error('[BILLING] Error in applyLateFees:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Record a payment against a bill
 */
const recordPayment = async (billId, amount, paymentMethod, studentId, schoolId, metadata = {}) => {
  try {
    const Payment = require('../models/Payment');

    // Validate bill exists
    const bill = await StudentBill.findOne({
      _id: billId,
      studentId,
      schoolId
    });

    if (!bill) {
      throw new Error('Bill not found or access denied');
    }

    // Validate payment amount
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    if (amount > bill.dueAmount) {
      throw new Error(`Payment amount exceeds due amount. Due: ${bill.dueAmount}, Provided: ${amount}`);
    }

    // Create payment record
    const payment = new Payment({
      studentId,
      billId,
      schoolId,
      amount,
      paymentMethod,
      paymentDate: new Date(),
      status: 'completed',
      previousBalance: bill.dueAmount,
      newBalance: bill.dueAmount - amount,
      metadata
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

    console.log(`[BILLING] Payment recorded for bill ${bill.billNumber}: ${amount}`);
    
    return {
      success: true,
      payment,
      bill,
      message: 'Payment recorded successfully'
    };
  } catch (error) {
    console.error('[BILLING] Error in recordPayment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get bill statistics for analytics
 */
const getBillingAnalytics = async (schoolId, startDate, endDate) => {
  try {
    const bills = await StudentBill.find({
      schoolId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const payments = await StudentBill.aggregate([
      {
        $match: {
          schoolId: schoolId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          dueAmount: { $sum: '$dueAmount' }
        }
      }
    ]);

    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPaid = bills.reduce((sum, b) => sum + b.paidAmount, 0);
    const totalDue = bills.reduce((sum, b) => sum + b.dueAmount, 0);
    const totalLate = bills.reduce((sum, b) => sum + (b.lateFee || 0), 0);

    const collectionRate = totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(2) : 0;

    return {
      success: true,
      analytics: {
        totalBills,
        totalAmount,
        totalPaid,
        totalDue,
        totalLate,
        collectionRate: `${collectionRate}%`,
        byStatus: payments
      }
    };
  } catch (error) {
    console.error('[BILLING] Error in getBillingAnalytics:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateMonthlyBills,
  generateBillForStudent,
  applyLateFees,
  recordPayment,
  getBillingAnalytics
};
