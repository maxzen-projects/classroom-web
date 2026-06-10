import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, ROLES } from '../routes';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait for auth state to load from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
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

export default RoleProtectedRoute;