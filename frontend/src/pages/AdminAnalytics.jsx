import React from 'react';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import { useGetAdminDashboardQuery } from '../redux/adminApi';
import { useGetAdminAnalyticsQuery } from '../redux/analyticsApi';
import { FaChartLine, FaTrophy, FaExclamationTriangle, FaCalendarCheck } from 'react-icons/fa';

const AdminAnalytics = () => {
  const { data, isLoading, error } = useGetAdminDashboardQuery();
  const { data: analytics, isLoading: analyticsLoading } = useGetAdminAnalyticsQuery();

  // Use real data from API or fallback to empty objects
  const schoolWideAnalytics = analytics?.schoolWideAnalytics || {
    totalStudents: data?.totalStudents || 0,
    totalTeachers: data?.totalTeachers || 0,
    totalClasses: data?.totalClasses || 0,
    averageAttendance: data?.attendancePercentage || 0,
    totalRevenue: 0,
    activeSubjects: 0
  };

  const topClasses = analytics?.topClasses || [];
  const lowPerformingClasses = analytics?.lowPerformingClasses || [];
  const attendanceTrends = analytics?.attendanceTrends || [];

  if (isLoading || analyticsLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <div className="p-6">
          <EmptyState
            title="Error Loading Analytics"
            description={error.data?.message || 'Failed to load analytics data'}
            icon="error"
          />
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-text mb-6">
          {data?.schoolName ? `${data.schoolName} Analytics` : 'Admin Analytics'}
        </h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow-sm border border-border bg-card-alt bg-blue-50">
            <div className="flex items-center">
              <FaChartLine className="text-blue-600 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">School Analytics</h3>
                <p className="text-2xl font-bold text-blue-600">{schoolWideAnalytics.totalStudents}</p>
                <p className="text-sm text-text-muted">Total Students</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border border-border bg-card-alt bg-green-50">
            <div className="flex items-center">
              <FaTrophy className="text-green-600 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Top Classes</h3>
                <p className="text-2xl font-bold text-green-600">{topClasses.length}</p>
                <p className="text-sm text-text-muted">Performing Well</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border border-border bg-card-alt bg-red-50">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-600 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Low Performing</h3>
                <p className="text-2xl font-bold text-red-600">{lowPerformingClasses.length}</p>
                <p className="text-sm text-text-muted">Need Attention</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border border-border bg-card-alt bg-purple-50">
            <div className="flex items-center">
              <FaCalendarCheck className="text-purple-600 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Attendance</h3>
                <p className="text-2xl font-bold text-purple-600">{schoolWideAnalytics.averageAttendance}%</p>
                <p className="text-sm text-text-muted">Average Rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* School-wide Analytics */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaChartLine className="text-blue-600 mr-2" />
              School-wide Analytics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-card-alt rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{schoolWideAnalytics.totalStudents}</p>
                <p className="text-sm text-text-muted">Students</p>
              </div>
              <div className="text-center p-4 bg-card-alt rounded-lg">
                <p className="text-2xl font-bold text-green-600">{schoolWideAnalytics.totalTeachers}</p>
                <p className="text-sm text-text-muted">Teachers</p>
              </div>
              <div className="text-center p-4 bg-card-alt rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{schoolWideAnalytics.totalClasses}</p>
                <p className="text-sm text-text-muted">Classes</p>
              </div>
              <div className="text-center p-4 bg-card-alt rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{schoolWideAnalytics.activeSubjects}</p>
                <p className="text-sm text-text-muted">Subjects</p>
              </div>
              <div className="text-center p-4 bg-card-alt rounded-lg col-span-2">
                <p className="text-2xl font-bold text-indigo-600">₹{schoolWideAnalytics.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-text-muted">Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Top Classes */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaTrophy className="text-green-600 mr-2" />
              Top Performing Classes
            </h2>
            <div className="space-y-4">
              {topClasses.map((cls, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-card-alt rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold mr-3">
                      {cls.rank}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text">{cls.name}</h3>
                      <p className="text-sm text-text-muted">Attendance: {cls.attendance}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{cls.averageScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low-performing Classes */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaExclamationTriangle className="text-red-600 mr-2" />
              Low-performing Classes
            </h2>
            <div className="space-y-4">
              {lowPerformingClasses.map((cls, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-card-alt rounded-lg border-l-4 border-red-500">
                  <div>
                    <h3 className="font-semibold text-text">{cls.name}</h3>
                    <p className="text-sm text-text-muted">Attendance: {cls.attendance}%</p>
                    <p className="text-xs text-red-600">{cls.issues}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{cls.averageScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Attendance Trends */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaCalendarCheck className="text-purple-600 mr-2" />
              Attendance Trends
            </h2>
            <div className="space-y-4">
              {attendanceTrends.map((trend, index) => (
                <div key={index} className="p-3 bg-card-alt rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-text">{trend.month}</h3>
                    <div className="flex items-center">
                      <span className={`text-sm font-bold ${trend.attendance >= trend.target ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.attendance}%
                      </span>
                      <span className="text-sm text-text-muted ml-1">/ {trend.target}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${trend.attendance >= trend.target ? 'bg-green-600' : 'bg-red-600'}`}
                      style={{ width: `${(trend.attendance / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminAnalytics;