import React from 'react';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';

const StudentSchedule = () => {
  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Schedule Page</h1>
        {/* Schedule implementation */}
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentSchedule;