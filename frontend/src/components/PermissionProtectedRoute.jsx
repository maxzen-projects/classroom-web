import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, ROLES } from '../routes';
import { useGetPermissionsQuery } from '../redux/permissionsApi';

const PermissionProtectedRoute = ({ children, requiredPermission }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch permissions for the current user's role
  const { data: permissionsData, isLoading: permissionsLoading } = useGetPermissionsQuery(user?.role, {
    skip: !user?.role || user?.role === 'super_admin' || user?.role === 'admin'
  });

  const userPermissions = permissionsData?.permissions || [];
  const isLoading = authLoading || permissionsLoading;

  // Check if user has the required permission
  const hasPermission = () => {
    if (!requiredPermission) return true;
    if (user?.role === 'admin' || user?.role === 'super_admin') return true;
    return userPermissions.includes(requiredPermission);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission()) {
    // Redirect to unauthorized page or dashboard
    switch (user?.role) {
      case ROLES.STUDENT:
        return <Navigate to="/student/dashboard" replace />;
      case ROLES.TEACHER:
        return <Navigate to="/teacher/dashboard" replace />;
      case ROLES.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      case ROLES.SUPER_ADMIN:
        return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PermissionProtectedRoute;
