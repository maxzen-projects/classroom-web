import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentBillDashboard from '../components/StudentBillDashboard';

const StudentFees = () => {
  const { user } = useAuth();

  return (
    <div className="bg-bg p-6 text-text theme-transition">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">My Fees & Payments</h1>
        <p className="text-text-muted">View your bills and manage your payments</p>
      </div>

      {user?._id && <StudentBillDashboard studentId={user._id} />}
    </div>
  );
};

export default StudentFees;
