const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Fee = require('../models/Fee');
const User = require('../models/User');
const Class = require('../models/Class');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');

// Helper to get schoolId from user
const getSchoolId = (user) => user.school || user.schoolId;

// GET /api/fees - Get all fees with filters
const getFees = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { classId, status, academicYear, studentId } = req.query;

    const query = { schoolId };

    // Role-based filtering
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Teachers only see students in their class or school
      if (classId) {
        query.classId = classId;
      } else {
        // Optional: Find classes where this teacher is assigned
        const teacherClasses = await Class.find({ classTeacher: req.user._id }).distinct('_id');
        query.classId = { $in: teacherClasses };
      }
    } else {
      // Admin/Super Admin
      if (classId) query.classId = classId;
      if (studentId) query.studentId = studentId;
    }

    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const fees = await Fee.find(query)
      .populate('studentId', 'name email rollNumber')
      .populate('classId', 'name section academicYear')
      .sort({ createdAt: -1 });

    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/fees/:id - Get single fee record
const getFeeById = async (req, res) => {
  try {
    const query = {
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    };

    // Role-based security for single record
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    const fee = await Fee.findOne(query)
      .populate('studentId', 'name email rollNumber')
      .populate('classId', 'name section academicYear');

    if (!fee) return res.status(404).json({ message: 'Fee record not found or access denied' });
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/fees/:id/pay - Record a payment
const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, remarks } = req.body;
    
    const query = {
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    };

    // Students can only pay their own fees
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }

    const fee = await Fee.findOne(query);

    if (!fee) return res.status(404).json({ message: 'Fee record not found or access denied' });
    if (amount <= 0) return res.status(400).json({ message: 'Payment amount must be greater than zero' });
    if (amount > fee.dueAmount) return res.status(400).json({ message: 'Payment amount exceeds due amount' });

    const payment = {
      amount,
      paymentMethod,
      transactionId,
      remarks: remarks || (req.user.role === 'student' ? 'Self-paid via student portal' : ''),
      receivedBy: req.user.role === 'student' ? null : req.user._id,
      paymentDate: new Date()
    };

    fee.payments.push(payment);
    fee.paidAmount += amount;
    fee.dueAmount -= amount;

    if (fee.dueAmount === 0) {
      fee.status = 'paid';
    } else {
      fee.status = 'partially_paid';
    }

    await fee.save();
    res.json({ message: 'Payment recorded successfully', fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/fees/:id - Update fee record (admin only)
const updateFee = async (req, res) => {
  try {
    const { totalAmount, dueDate } = req.body;
    const fee = await Fee.findOne({
      _id: req.params.id,
      schoolId: getSchoolId(req.user)
    });

    if (!fee) return res.status(404).json({ message: 'Fee record not found' });

    if (totalAmount !== undefined) {
      fee.totalAmount = totalAmount;
      fee.dueAmount = totalAmount - fee.paidAmount;
      
      if (fee.dueAmount <= 0) {
        fee.status = 'paid';
        fee.dueAmount = 0;
      } else if (fee.paidAmount > 0) {
        fee.status = 'partially_paid';
      } else {
        fee.status = 'unpaid';
      }
    }

    if (dueDate) fee.dueDate = new Date(dueDate);

    await fee.save();
    res.json({ message: 'Fee record updated successfully', fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/fees/report - Generate fee report
const generateFeeReport = async (req, res) => {
  try {
    const schoolId = getSchoolId(req.user);
    const { format, classId, academicYear } = req.query;

    const query = { schoolId };
    if (classId) query.classId = classId;
    if (academicYear) query.academicYear = academicYear;

    const fees = await Fee.find(query)
      .populate('studentId', 'name rollNumber')
      .populate('classId', 'name section');

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fee Report');

      worksheet.columns = [
        { header: 'Student Name', key: 'name', width: 25 },
        { header: 'Roll Number', key: 'roll', width: 15 },
        { header: 'Class', key: 'class', width: 15 },
        { header: 'Total Fee', key: 'total', width: 15 },
        { header: 'Paid', key: 'paid', width: 15 },
        { header: 'Due', key: 'due', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      fees.forEach(fee => {
        worksheet.addRow({
          name: fee.studentId?.name || 'N/A',
          roll: fee.studentId?.rollNumber || 'N/A',
          class: `${fee.classId?.name || ''} ${fee.classId?.section || ''}`,
          total: fee.totalAmount,
          paid: fee.paidAmount,
          due: fee.dueAmount,
          status: fee.status.toUpperCase()
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=fee_report_${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=fee_report_${Date.now()}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text('Fee Payment Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`);
      doc.moveDown();

      fees.forEach((fee, index) => {
        doc.fontSize(10).text(`${index + 1}. Student: ${fee.studentId?.name || 'N/A'} | Class: ${fee.classId?.name || ''}${fee.classId?.section || ''} | Total: ${fee.totalAmount} | Paid: ${fee.paidAmount} | Due: ${fee.dueAmount}`);
        if (index % 25 === 0 && index !== 0) doc.addPage();
      });

      doc.end();
      return;
    }

    res.status(400).json({ message: 'Invalid format specified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const router = express.Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['admin', 'super_admin', 'teacher', 'student']), getFees);
router.get('/report', roleMiddleware(['admin', 'super_admin']), generateFeeReport);
router.get('/:id', roleMiddleware(['admin', 'super_admin', 'teacher', 'student']), getFeeById);
router.post('/:id/pay', roleMiddleware(['admin', 'super_admin', 'student']), recordPayment);
router.put('/:id', roleMiddleware(['admin', 'super_admin']), updateFee);

module.exports = router;
