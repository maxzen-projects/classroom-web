import React from 'react';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';

const AdminManageReports = () => {
  return (
    <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Reports</h1>
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminManageReports;