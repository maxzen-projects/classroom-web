import React, { useState } from 'react';
import { useGetBillingDashboardQuery, useGetPendingDuesQuery, useGetLateFeesReportQuery, useGenerateMonthlyBillsMutation, useCheckLateFeesMutation } from '../services/billingApi';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, DollarSign, Clock } from 'lucide-react';

const BillingAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  const { data: analytics = {} } = useGetBillingDashboardQuery(dateRange.startDate ? dateRange : undefined);
  const { data: pendingData = {} } = useGetPendingDuesQuery();
  const { data: lateFeesData = {} } = useGetLateFeesReportQuery();
  const [generateBills, { isLoading: isGenerating }] = useGenerateMonthlyBillsMutation();
  const [checkLateFees, { isLoading: isChecking }] = useCheckLateFeesMutation();

  const handleGenerateBills = async () => {
    if (window.confirm('Generate bills for all students this month?')) {
      try {
        const result = await generateBills({}).unwrap();
        alert(`Generated ${result.totalGenerated} bills, ${result.totalFailed} failed`);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleCheckLateFees = async () => {
    if (window.confirm('Check and apply late fees?')) {
      try {
        const result = await checkLateFees({}).unwrap();
        alert(`Applied late fees to ${result.totalApplied} bills`);
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const analyticsData = analytics.analytics || {};
  const chartData = analyticsData.byStatus || [];

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Billing Operations</h2>
        <div className="flex gap-4">
          <button
            onClick={handleGenerateBills}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating...' : 'Generate Monthly Bills'}
          </button>
          <button
            onClick={handleCheckLateFees}
            disabled={isChecking}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:bg-gray-400"
          >
            {isChecking ? 'Checking...' : 'Apply Late Fees'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bills</p>
              <p className="text-3xl font-bold">{analyticsData.totalBills || 0}</p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Collection</p>
              <p className="text-3xl font-bold">₹{analyticsData.totalPaid || 0}</p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Dues</p>
              <p className="text-3xl font-bold">₹{analyticsData.totalDue || 0}</p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Late Fees</p>
              <p className="text-3xl font-bold">₹{analyticsData.totalLate || 0}</p>
            </div>
            <AlertTriangle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Collection Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Collection Rate</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold text-green-600">{analyticsData.collectionRate || '0%'}</div>
          <div className="flex-1 bg-gray-200 rounded h-8">
            <div
              className="bg-green-600 h-full rounded"
              style={{ width: analyticsData.collectionRate || '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Bills by Status</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Revenue Overview</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="paidAmount" fill="#3B82F6" name="Paid" />
                <Bar dataKey="dueAmount" fill="#F59E0B" name="Due" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Pending Dues List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Top Pending Dues</h3>
        {pendingData.pendingBills?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-right">Due Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingData.pendingBills.map((bill) => (
                  <tr key={bill._id} className="border-b">
                    <td className="px-4 py-2">{bill.studentId?.name}</td>
                    <td className="px-4 py-2">{bill.classId?.name}</td>
                    <td className="px-4 py-2 text-right font-bold">₹{bill.dueAmount}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        bill.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {bill.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">No pending dues</div>
        )}
      </div>

      {/* Late Fees Report */}
      {lateFeesData.billsWithLateFees?.length > 0 && (
        <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
          <h3 className="text-lg font-bold mb-4 text-red-800">⚠️ Late Fees Applied</h3>
          <div className="space-y-2">
            {lateFeesData.billsWithLateFees.slice(0, 5).map((bill) => (
              <div key={bill._id} className="flex justify-between items-center p-3 bg-white rounded border border-red-200">
                <div>
                  <div className="font-bold">{bill.studentId?.name}</div>
                  <div className="text-sm text-gray-600">Bill: {bill.billNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">₹{bill.lateFee}</div>
                  <div className="text-xs text-gray-600">Late Fee</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t text-center font-bold">
            Total Late Fees: ₹{lateFeesData.totalLateFees || 0}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingAnalyticsDashboard;
