# 💰 Complete Billing & Fee Management System

A production-ready monthly billing system for educational institutions with automatic bill generation, late fee tracking, payment management, and real-time analytics.

---

## 📋 Features

### ✅ Fee Structure Management
- Create tuition, recurring, and extra fees
- Set due dates and late fee amounts
- Configure fixed or percentage-based late fees
- Apply fees globally or to specific classes

### ✅ Monthly Billing System
- Automatic bill generation (1st of month at 3 AM)
- Includes: tuition + previous due + extra fees + late fees
- Unique bill numbering system
- Prevents duplicate bills per student/month
- Bill status tracking (draft, generated, unpaid, partially_paid, paid, overdue)

### ✅ Due Carry Forward
- Automatically adds unpaid dues to next month's bill
- Tracks carried-over dues with reference to previous bill
- Supports conditional carry-forward based on fee structure

### ✅ Late Fee Automation
- Daily late fee checker (2 AM)
- Automatically applies late fees to overdue bills
- Fixed or percentage-based late fee calculation
- Applied only once per bill (prevents duplicate charges)

### ✅ Extra Charges Management
- Transport, books, uniform, hostel, exam fees
- Editable and student-wise assignable
- Multiple frequency options (one-time, monthly, quarterly, annual)

### ✅ Payment Tracking
- Record payments with multiple methods (cash, online, bank transfer, cheque)
- Transaction history with receipt generation
- Prevent overpayment validation
- Payment method and reference number tracking
- Receipt numbering system

### ✅ Real-time Monitoring
- Socket.IO integration for live updates
- Analytics dashboard with charts
- Pending dues tracking
- Late fees report
- Collection rate calculation

---

## 🗂️ Database Models

### 1. **FeeStructure**
Defines fee types and amounts for the school/class.

```javascript
{
  schoolId, classId,
  feeType, name, description,
  amount, frequency, dueDay,
  lateFeeAmount, lateFeePercentage,
  carryForwardDue, isActive,
  appliesTo (all_students, specific_class, custom),
  createdBy, updatedBy
}
```

### 2. **ExtraFee**
Manages additional charges like transport, books, etc.

```javascript
{
  schoolId, name (enum), description,
  amount, frequency, dueDay,
  isActive, appliedToClasses, appliedToStudents,
  createdBy, updatedBy
}
```

### 3. **StudentBill**
Monthly bill record for each student.

```javascript
{
  studentId, classId, schoolId,
  billMonth, billYear, billNumber (unique),
  
  // Components
  tuitionFee, previousDue, extraFees[], lateFee,
  totalAmount, paidAmount, dueAmount,
  
  // Tracking
  dueDate, status, isLateFeesApplied,
  isCarriedForward, carriedFromBillId,
  notes, lastModifiedBy, generatedAutomatically
}
```

### 4. **Payment**
Separate transaction record for payment tracking.

```javascript
{
  studentId, billId, schoolId,
  amount, paymentDate, paymentMethod,
  transactionId, referenceNumber,
  paymentGateway, status,
  remarks, receivedBy,
  receiptNumber, receiptIssued,
  previousBalance, newBalance,
  metadata
}
```

---

## 🚀 API Endpoints

### Fee Structures
```
POST   /api/billing/fee-structures          (Create)
GET    /api/billing/fee-structures          (List)
GET    /api/billing/fee-structures/:id      (Get)
PUT    /api/billing/fee-structures/:id      (Update)
DELETE /api/billing/fee-structures/:id      (Delete)
```

### Extra Fees
```
POST   /api/billing/extra-fees              (Create)
GET    /api/billing/extra-fees              (List)
PUT    /api/billing/extra-fees/:id          (Update)
DELETE /api/billing/extra-fees/:id          (Delete)
```

### Student Bills
```
GET    /api/billing/bills                   (List - role-based)
GET    /api/billing/bills/:id               (Get single)
PUT    /api/billing/bills/:id               (Update - admin)
POST   /api/billing/bills/generate/manual   (Manual generation)
```

### Payments
```
POST   /api/billing/bills/:billId/payments  (Record payment)
GET    /api/billing/payments                (Payment history - role-based)
```

### Analytics
```
GET    /api/billing/analytics/dashboard     (Overview stats)
GET    /api/billing/analytics/pending-dues  (Unpaid bills)
GET    /api/billing/analytics/late-fees     (Late fee report)
POST   /api/billing/late-fees/check         (Manual late fee check)
```

---

## ⚙️ Automated Cron Jobs

### Monthly Bill Generation
**Schedule:** 1st of month at 3:00 AM
- Generates bills for all active students
- Includes carry-forward logic
- Creates unique bill numbers

### Late Fee Checker
**Schedule:** Every day at 2:00 AM
- Checks bills with passed due date
- Applies late fees automatically (once per bill)
- Updates bill status to 'overdue'

### Weekly Reminders
**Schedule:** Every Monday at 8:00 AM
- Identifies overdue bills
- Triggers reminder notifications (future integration)

### Analytics Update
**Schedule:** Every day at 4:00 AM
- Updates bill statuses based on payment/due dates
- Recalculates collection metrics
- Maintains analytics cache

---

## 👥 Role-Based Access Control

| Action | Admin | Teacher | Student |
|--------|-------|---------|---------|
| Create Fee Structures | ✅ | ❌ | ❌ |
| Manage Extra Fees | ✅ | ❌ | ❌ |
| View All Bills | ✅ | ✅ | ❌ |
| View Own Bills | ✅ | ❌ | ✅ |
| Record Payment | ✅ | ❌ | ✅ |
| Edit Bills | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ❌ | ❌ |
| View Payment History | ✅ | ❌ | ✅ |

---

## 🎨 Frontend Components

### Admin Dashboard
- `BillingFeeStructureManager` - Create/edit fee structures
- `BillingExtraFeeManager` - Manage transport, books, etc.
- `BillingAnalyticsDashboard` - Revenue, pending dues, late fees charts
- Manual bill generation & late fee check buttons

### Student Dashboard
- `StudentBillDashboard` - View bills, pay fees
- Current month bill display with breakdown
- Payment history with receipts
- Pending dues highlighting

---

## 🔧 Setup Instructions

### Backend Setup

1. **Models already created:**
   ```
   - backend/models/FeeStructure.js
   - backend/models/ExtraFee.js
   - backend/models/StudentBill.js
   - backend/models/Payment.js
   ```

2. **Utilities:**
   ```
   - backend/utils/billingService.js (core logic)
   - backend/utils/billingCrons.js (automation)
   - backend/utils/billingController.js (API handlers)
   ```

3. **Routes:**
   ```
   - backend/routes/billing.js (all endpoints)
   ```

4. **Server Integration:**
   - Already added to `server.js`
   - Cron jobs initialized on startup
   - Socket.IO integration ready

### Frontend Setup

1. **RTK Query API:**
   ```
   - frontend/src/services/billingApi.js
   ```

2. **Components:**
   ```
   - frontend/src/components/BillingFeeStructureManager.jsx
   - frontend/src/components/BillingExtraFeeManager.jsx
   - frontend/src/components/StudentBillDashboard.jsx
   - frontend/src/components/BillingAnalyticsDashboard.jsx
   ```

3. **Redux Store:**
   - Already integrated in `frontend/src/redux/store.js`

---

## 💡 Business Logic Examples

### Example 1: Monthly Bill Generation
```javascript
// Bill generated for June 2026
{
  billMonth: 6,
  billYear: 2026,
  billNumber: "SCH-2026-06-A123",
  tuitionFee: 5000,
  previousDue: 1000,  // From May unpaid
  extraFees: [
    { name: "transport", amount: 500 },
    { name: "books", amount: 300 }
  ],
  totalAmount: 6800,
  paidAmount: 0,
  dueAmount: 6800,
  status: "generated"
}

// After payment of ₹3500:
{
  paidAmount: 3500,
  dueAmount: 3300,
  status: "partially_paid"
}

// After due date passes (no payment):
{
  lateFee: 200,  // Auto-applied
  totalAmount: 7000,
  dueAmount: 3500,
  status: "overdue"
}
```

### Example 2: Due Carry Forward
```javascript
// May bill unpaid
May Bill: totalAmount=5000, dueAmount=5000

// June bill generated
June Bill: {
  tuitionFee: 5000,
  previousDue: 5000,  // Carried from May
  totalAmount: 10000,
  dueAmount: 10000,
  isCarriedForward: true,
  carriedFromBillId: <May Bill ID>
}
```

---

## 🔐 Validations

✅ **Duplicate Prevention**
- Compound unique index on (studentId, schoolId, billMonth, billYear)

✅ **Overpayment Prevention**
- Payment amount validated against dueAmount

✅ **Late Fee Single Application**
- isLateFeesApplied flag prevents duplicate late fee charges

✅ **Bill Immutability**
- Bills locked after first payment recorded

✅ **Amount Validations**
- No negative amounts for fees, payments, or amounts
- Late fee percentage 0-100

✅ **Carry Forward Validation**
- Only unpaid dues carried forward
- Reference maintained to source bill

---

## 📊 Analytics Metrics

### Dashboard Shows
- **Total Bills Generated** - Count of all bills
- **Total Collection** - Sum of all payments
- **Pending Dues** - Sum of unpaid amounts
- **Late Fees** - Total late fees charged
- **Collection Rate** - (Total Paid / Total Amount) * 100%

### Charts
- Pie chart: Bills by status distribution
- Bar chart: Revenue by status (paid vs due)

### Reports
- Pending dues list with student names
- Late fees applied with details
- Payment history with dates and methods

---

## 🚨 Error Handling

### Common Error Scenarios

**Duplicate Bill Prevention**
```
Error: Bill already exists for this student in June 2026
```

**Overpayment Prevention**
```
Error: Payment exceeds due amount. Due: ₹1000, Provided: ₹1500
```

**Access Denial**
```
Error: Student cannot view other student's bills
```

**Invalid Fee Structure**
```
Error: Late fee percentage cannot exceed 100
```

---

## 📱 Socket.IO Events

```javascript
// Emitted when payment is recorded
io.to(`school_${schoolId}`).emit('payment_recorded', {
  billId,
  amount,
  newDueAmount,
  billStatus
});

// Admin can listen for real-time updates
socket.on('payment_recorded', (data) => {
  // Update UI with payment confirmation
});
```

---

## 🧪 Testing Checklist

- [ ] Create fee structure
- [ ] Create extra fees
- [ ] Generate monthly bills manually
- [ ] Verify bill carries over to next month
- [ ] Record partial payment
- [ ] Record full payment
- [ ] Check late fee application after due date
- [ ] View analytics dashboard
- [ ] Verify role-based access
- [ ] Test prevent overpayment
- [ ] Verify bill number uniqueness

---

## 🔄 Integration Notes

### With Existing Systems
- Uses existing User, Class, School models
- Integrates with role-based middleware
- Respects school and academic year structure
- Compatible with existing authentication

### Future Enhancements
- Email notifications for due bills
- SMS reminders
- Online payment gateway integration
- Receipt PDF generation
- Bulk import of fee structures
- Discount management
- Scholarship integration
- Refund processing

---

## 📞 Support

For issues or questions about the billing system:
1. Check error messages and validation rules
2. Verify role-based permissions
3. Check cron job logs (console output)
4. Review database indexes for performance

---

**Last Updated:** May 14, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
