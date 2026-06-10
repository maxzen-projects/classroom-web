const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const billingController = require('../utils/billingController');
const { triggerMonthlyBillGeneration, triggerLateFeesCheck } = require('../utils/billingCrons');

// Apply authentication to all routes
router.use(authMiddleware);

// ==================== FEE STRUCTURE ROUTES ====================
router.post(
  '/fee-structures',
  roleMiddleware(['admin', 'super_admin']),
  billingController.createFeeStructure
);

router.get(
  '/fee-structures',
  roleMiddleware(['admin', 'super_admin', 'teacher']),
  billingController.getFeeStructures
);

router.get(
  '/fee-structures/:id',
  roleMiddleware(['admin', 'super_admin', 'teacher']),
  billingController.getFeeStructureById
);

router.put(
  '/fee-structures/:id',
  roleMiddleware(['admin', 'super_admin']),
  billingController.updateFeeStructure
);

router.delete(
  '/fee-structures/:id',
  roleMiddleware(['admin', 'super_admin']),
  billingController.deleteFeeStructure
);

// ==================== EXTRA FEE ROUTES ====================
router.post(
  '/extra-fees',
  roleMiddleware(['admin', 'super_admin']),
  billingController.createExtraFee
);

router.get(
  '/extra-fees',
  roleMiddleware(['admin', 'super_admin', 'teacher']),
  billingController.getExtraFees
);

router.put(
  '/extra-fees/:id',
  roleMiddleware(['admin', 'super_admin']),
  billingController.updateExtraFee
);

router.delete(
  '/extra-fees/:id',
  roleMiddleware(['admin', 'super_admin']),
  billingController.deleteExtraFee
);

// ==================== STUDENT BILL ROUTES ====================
router.get(
  '/bills',
  roleMiddleware(['admin', 'super_admin', 'teacher', 'student']),
  billingController.getStudentBills
);

router.get(
  '/bills/:id',
  roleMiddleware(['admin', 'super_admin', 'teacher', 'student']),
  billingController.getBillById
);

router.put(
  '/bills/:id',
  roleMiddleware(['admin', 'super_admin']),
  billingController.updateBill
);

// Manual bill generation trigger
router.post(
  '/bills/generate/manual',
  roleMiddleware(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const { billDate, schoolId } = req.body;
      const result = await triggerMonthlyBillGeneration(
        billDate ? new Date(billDate) : new Date(),
        schoolId
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ==================== PAYMENT ROUTES ====================
router.post(
  '/bills/:billId/payments',
  roleMiddleware(['admin', 'super_admin', 'student']),
  billingController.recordPayment
);

router.get(
  '/payments',
  roleMiddleware(['admin', 'super_admin', 'teacher', 'student']),
  billingController.getPaymentHistory
);

// ==================== ANALYTICS ROUTES ====================
router.get(
  '/analytics/dashboard',
  roleMiddleware(['admin', 'super_admin']),
  billingController.getBillingDashboard
);

router.get(
  '/analytics/pending-dues',
  roleMiddleware(['admin', 'super_admin', 'teacher']),
  billingController.getPendingDues
);

router.get(
  '/analytics/late-fees',
  roleMiddleware(['admin', 'super_admin']),
  billingController.getLateFeesReport
);

// Manual late fee check trigger
router.post(
  '/late-fees/check',
  roleMiddleware(['admin', 'super_admin']),
  async (req, res) => {
    try {
      const { schoolId } = req.body;
      const result = await triggerLateFeesCheck(schoolId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
