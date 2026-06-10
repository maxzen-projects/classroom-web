import React, { createContext, useState, useEffect } from 'react';
import { useLoginMutation, useRegisterMutation, useForgotPasswordMutation, useResetPasswordMutation, authApi } from '../redux/authApi';
import { academicApi } from '../redux/academicApi';
import { studentsApi } from '../redux/studentsApi';
import { teachersApi } from '../redux/teachersApi';
import { profileApi } from '../redux/profileApi';
import { adminApi } from '../redux/adminApi';
import { superAdminApi } from '../redux/superAdminApi';
import { schoolApi } from '../redux/schoolApi';
import { attendanceApi } from '../redux/attendanceApi';
import { externalExamsApi } from '../redux/externalExamsApi';
import { store } from '../redux/store';

// const AuthContext = createContext();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [forgotPasswordMutation] = useForgotPasswordMutation();
  const [resetPasswordMutation] = useResetPasswordMutation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser?.id && !parsedUser._id) {
        parsedUser._id = parsedUser.id;
      }
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const result = await loginMutation({ email, password }).unwrap();
      const { token, user: userData } = result;
      const normalizedUser = { ...userData, _id: userData._id || userData.id };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      setIsAuthenticated(true);
      // Clear any existing caches to ensure fresh data
      store.dispatch(authApi.util.resetApiState());
      store.dispatch(academicApi.util.resetApiState());
      store.dispatch(studentsApi.util.resetApiState());
      store.dispatch(teachersApi.util.resetApiState());
      store.dispatch(profileApi.util.resetApiState());
      store.dispatch(adminApi.util.resetApiState());
      store.dispatch(superAdminApi.util.resetApiState());
      store.dispatch(schoolApi.util.resetApiState());
      store.dispatch(attendanceApi.util.resetApiState());
      store.dispatch(externalExamsApi.util.resetApiState());
      return { success: true };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, phone, password, role) => {
    try {
      const result = await registerMutation({ name, email, phone, password, role }).unwrap();
      return { success: true, message: result.message };
    } catch (error) {
      // Extract error message from various possible response formats
      const errorMessage = 
        error.data?.message || 
        error.message || 
        'Registration failed. Please try again.';
      
      console.error('Registration error:', error);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    // Clear API caches
    store.dispatch(authApi.util.resetApiState());
    store.dispatch(academicApi.util.resetApiState());
    store.dispatch(studentsApi.util.resetApiState());
    store.dispatch(teachersApi.util.resetApiState());
    store.dispatch(profileApi.util.resetApiState());
    store.dispatch(adminApi.util.resetApiState());
    store.dispatch(superAdminApi.util.resetApiState());
    store.dispatch(schoolApi.util.resetApiState());
    store.dispatch(attendanceApi.util.resetApiState());
    store.dispatch(externalExamsApi.util.resetApiState());
  };

  const forgotPassword = async (email) => {
    try {
      const result = await forgotPasswordMutation({ email }).unwrap();
      return { success: true, message: result.message || 'Check your email for password reset link' };
    } catch (error) {
      const errorMsg = error.data?.message || error.message || 'Failed to send reset email';
      return { success: false, error: errorMsg };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const result = await resetPasswordMutation({ token, password }).unwrap();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, error: error.data?.message || 'Failed to reset password' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      loading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
