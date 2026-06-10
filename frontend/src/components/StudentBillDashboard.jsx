import React, { useState } from 'react';
import { useGetStudentBillsQuery, useRecordPaymentMutation } from '../services/billingApi';
import { CreditCard, FileText } from 'lucide-react';

const StudentBillDashboard = ({ studentId }) => {
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');

  const { data: billsData = {}, isLoading } = useGetStudentBillsQuery({ studentId });
  const bills = billsData.bills || [];
  const [recordPayment] = useRecordPaymentMutation();

  const handlePayment = async () => {
    if (!selectedBill || !paymentAmount) {
      alert('Select bill and enter amount');
      return;
    }

    try {
      await recordPayment({
        billId: selectedBill._id,
        amount: parseFloat(paymentAmount),
        paymentMethod
      }).unwrap();

      alert('Payment recorded successfully!');
      setPaymentAmount('');
      setSelectedBill(null);
    } catch (error) {
      alert('Payment error: ' + error.message);
    }
  };

  if (isLoading) return <div className="p-4">Loading bills...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">My Bills & Payments</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {bills.slice(0, 3).map((bill) => (
          <div
            key={bill._id}
            onClick={() => setSelectedBill(bill)}
            className={`p-4 rounded-lg cursor-pointer border-2 transition ${
              selectedBill?._id === bill._id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{bill.billPeriod}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {bill.status.toUpperCase()}
              </span>
            </div>
            <div className="text-sm space-y-1">
              <div>Total: ₹{bill.totalAmount}</div>
              <div>Paid: ₹{bill.paidAmount}</div>
              <div className="font-bold text-red-600">Due: ₹{bill.dueAmount}</div>
              {bill.lateFee > 0 && <div className="text-red-600">Late Fee: ₹{bill.lateFee}</div>}
            </div>
          </div>
        ))}
      </div>

      {selectedBill && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
          <h3 className="text-lg font-bold mb-4">Bill Details: {selectedBill.billPeriod}</h3>

          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
              <span>Tuition Fee:</span>
              <span>₹{selectedBill.tuitionFee}</span>
            </div>
            {selectedBill.previousDue > 0 && (
              <div className="flex justify-between">
                <span>Previous Due:</span>
                <span>₹{selectedBill.previousDue}</span>
              </div>
            )}
            {selectedBill.extraFees?.map((fee, i) => (
              <div key={i} className="flex justify-between">
                <span>{fee.name}:</span>
                <span>₹{fee.amount}</span>
              </div>
            ))}
            {selectedBill.lateFee > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>Late Fee:</span>
                <span>₹{selectedBill.lateFee}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total Due:</span>
              <span className="text-lg">₹{selectedBill.dueAmount}</span>
            </div>
          </div>

          {selectedBill.dueAmount > 0 && (
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Payment Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedBill.dueAmount}
                className="w-full border rounded px-3 py-2"
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="online">Online Payment</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
              <button
                onClick={handlePayment}
                className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CreditCard size={20} /> Pay Now
              </button>
            </div>
          )}
        </div>
      )}

      <h3 className="text-lg font-bold mb-4">All Bills</h3>
      <div className="space-y-2">
        {bills.map((bill) => (
          <div key={bill._id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
            <div>
              <div className="font-bold">{bill.billPeriod}</div>
              <div className="text-sm text-gray-600">Due: {new Date(bill.dueDate).toLocaleDateString()}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">₹{bill.totalAmount}</div>
              <div className={`text-sm ${bill.dueAmount === 0 ? 'text-green-600' : 'text-red-600'}`}>
                Due: ₹{bill.dueAmount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentBillDashboard;
