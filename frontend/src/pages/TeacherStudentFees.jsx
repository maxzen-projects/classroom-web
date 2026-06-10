import React, { useState } from 'react';
import { useGetStudentBillsQuery } from '../services/billingApi';
import { useGetClassesQuery } from '../redux/academicApi';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { FaUserGraduate, FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const TeacherStudentFees = () => {
  const [filters, setFilters] = useState({
    classId: '',
    status: '',
  });

  const { data: billsData, isLoading: billsLoading } = useGetStudentBillsQuery(filters);
  const { data: classes } = useGetClassesQuery();
  const bills = billsData?.bills || [];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (billsLoading) return <Loader />;

  // Calculate some stats for the current view
  const stats = bills.reduce((acc, bill) => {
    acc.total += 1;
    if (bill.status === 'paid') acc.paid += 1;
    else if (bill.status === 'partial') acc.partial += 1;
    else acc.unpaid += 1;
    acc.totalDue += bill.dueAmount;
    return acc;
  }, { total: 0, paid: 0, partial: 0, unpaid: 0, totalDue: 0 });

  return (
    <div className="bg-bg p-6 text-text theme-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">Student Fee Monitoring</h1>
        <p className="text-text-muted">Monitor fee payment status of your students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 border-l-4 border-primary flex items-center gap-4">
          <div className="bg-primary-soft p-3 rounded-xl text-primary">
            <FaUserGraduate className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase font-bold">Total Students</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-success flex items-center gap-4">
          <div className="bg-success-soft p-3 rounded-xl text-success">
            <FaCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase font-bold">Fully Paid</p>
            <p className="text-2xl font-bold text-success">{stats.paid}</p>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-warning flex items-center gap-4">
          <div className="bg-warning-soft p-3 rounded-xl text-warning">
            <FaClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase font-bold">Pending/Partial</p>
            <p className="text-2xl font-bold text-warning">{stats.partial + stats.unpaid}</p>
          </div>
        </div>
        <div className="card p-4 border-l-4 border-danger flex items-center gap-4">
          <div className="bg-danger-soft p-3 rounded-xl text-danger">
            <FaMoneyBillWave className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase font-bold">Total Dues</p>
            <p className="text-2xl font-bold text-danger">₹{stats.totalDue}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-panel mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-text-muted mb-1">Select Class</label>
            <select
              name="classId"
              value={filters.classId}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All My Classes</option>
              {classes?.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name} - {cls.section}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-text-muted mb-1">Payment Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <button
            onClick={() => setFilters({ classId: '', status: '' })}
            className="btn-secondary px-6"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Student List */}
      {bills.length > 0 ? (
        <div className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-card-alt text-left">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Student</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Class</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted">Bill Period</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Total</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Paid</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-right">Due</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-muted text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-card-alt theme-transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-text">{bill.studentId?.name}</div>
                      <div className="text-xs text-text-muted">Roll: {bill.studentId?.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {bill.classId?.name} - {bill.classId?.section}
                    </td>
                    <td className="px-6 py-4 text-sm">{bill.billPeriod}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right">₹{bill.totalAmount}</td>
                    <td className="px-6 py-4 text-sm font-bold text-success text-right">₹{bill.paidAmount}</td>
                    <td className="px-6 py-4 text-sm font-bold text-danger text-right">₹{bill.dueAmount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        bill.status === 'paid' ? 'bg-success-soft text-success' :
                        bill.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        bill.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {bill.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No Records Found" description="Try adjusting your filters or contact admin." icon="money" />
      )}
      
      <div className="mt-8 p-4 bg-info-soft rounded-2xl border border-info flex items-start gap-3 text-info">
        <FaExclamationCircle className="w-5 h-5 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold mb-1">Teacher Access Note</p>
          <p>You have view-only access to fee statuses. For payment updates or structure changes, please contact the school administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentFees;
