const cron = require('node-cron');
const { generateMonthlyBills, applyLateFees } = require('./billingService');

let billingCronTasks = [];

/**
 * Initialize all billing automation cron jobs
 */
const initializeBillingCrons = () => {
  try {
    console.log('[CRON] Initializing billing automation cron jobs...');

    // Monthly Bill Generation - 1st of month at 03:00 AM
    const monthlyBillCron = cron.schedule('0 3 1 * *', async () => {
      console.log('[CRON] ⏰ Running monthly bill generation job...');
      try {
        const result = await generateMonthlyBills();
        console.log('[CRON] ✅ Monthly bill generation completed:', result);
      } catch (error) {
        console.error('[CRON] ❌ Monthly bill generation failed:', error);
      }
    });

    billingCronTasks.push({
      name: 'monthlyBillGeneration',
      schedule: '0 3 1 * *',
      description: 'Generate bills for all students on 1st of month at 3 AM',
      task: monthlyBillCron
    });

    // Late Fee Checker - Daily at 02:00 AM
    const lateFeeCron = cron.schedule('0 2 * * *', async () => {
      console.log('[CRON] ⏰ Running late fee checker job...');
      try {
        const result = await applyLateFees();
        console.log('[CRON] ✅ Late fee checker completed:', result);
      } catch (error) {
        console.error('[CRON] ❌ Late fee checker failed:', error);
      }
    });

    billingCronTasks.push({
      name: 'lateFeeChecker',
      schedule: '0 2 * * *',
      description: 'Check and apply late fees to overdue bills daily at 2 AM',
      task: lateFeeCron
    });

    // Weekly Payment Reminders - Every Monday at 08:00 AM
    const reminderCron = cron.schedule('0 8 * * 1', async () => {
      console.log('[CRON] ⏰ Running weekly payment reminder job...');
      try {
        const StudentBill = require('../models/StudentBill');
        const pendingBills = await StudentBill.find({
          status: { $in: ['unpaid', 'partially_paid', 'overdue'] },
          dueDate: { $lte: new Date() }
        }).countDocuments();

        console.log(`[CRON] ✅ Found ${pendingBills} pending bills for reminders`);
        // TODO: Send email reminders to students with pending bills
      } catch (error) {
        console.error('[CRON] ❌ Payment reminder job failed:', error);
      }
    });

    billingCronTasks.push({
      name: 'paymentReminders',
      schedule: '0 8 * * 1',
      description: 'Send payment reminders every Monday at 8 AM',
      task: reminderCron
    });

    // Billing Analytics Update - Every day at 04:00 AM
    const analyticsCron = cron.schedule('0 4 * * *', async () => {
      console.log('[CRON] ⏰ Running analytics update job...');
      try {
        const StudentBill = require('../models/StudentBill');
        
        // Update bill statuses based on payment date
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        await StudentBill.updateMany(
          {
            dueDate: { $lt: now },
            status: { $in: ['unpaid', 'partially_paid'] }
          },
          { status: 'overdue' }
        );

        console.log('[CRON] ✅ Analytics update completed');
      } catch (error) {
        console.error('[CRON] ❌ Analytics update failed:', error);
      }
    });

    billingCronTasks.push({
      name: 'analyticsUpdate',
      schedule: '0 4 * * *',
      description: 'Update analytics and bill statuses daily at 4 AM',
      task: analyticsCron
    });

    console.log('[CRON] ✅ All billing cron jobs initialized successfully');
    console.log(`[CRON] Registered ${billingCronTasks.length} cron tasks`);

    return billingCronTasks;
  } catch (error) {
    console.error('[CRON] Error initializing billing crons:', error);
    throw error;
  }
};

/**
 * Get all active cron tasks
 */
const getBillingCronTasks = () => {
  return billingCronTasks.map(task => ({
    name: task.name,
    schedule: task.schedule,
    description: task.description,
    isRunning: true
  }));
};

/**
 * Stop all cron tasks
 */
const stopBillingCrons = () => {
  billingCronTasks.forEach(task => {
    task.task.stop();
  });
  console.log('[CRON] ✅ All billing cron jobs stopped');
  billingCronTasks = [];
};

/**
 * Manually trigger monthly bill generation
 */
const triggerMonthlyBillGeneration = async (billDate = new Date(), schoolId = null) => {
  console.log('[CRON] 🔔 Manually triggering monthly bill generation');
  return await generateMonthlyBills(billDate, schoolId);
};

/**
 * Manually trigger late fee check
 */
const triggerLateFeesCheck = async (schoolId = null) => {
  console.log('[CRON] 🔔 Manually triggering late fees check');
  return await applyLateFees(schoolId);
};

module.exports = {
  initializeBillingCrons,
  getBillingCronTasks,
  stopBillingCrons,
  triggerMonthlyBillGeneration,
  triggerLateFeesCheck
};
