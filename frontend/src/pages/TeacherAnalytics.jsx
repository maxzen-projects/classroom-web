import React from 'react';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import { useGetTeacherSubjectsQuery, useGetTeacherStudentsQuery } from '../redux/teacherApi';
import { useGetTeacherAnalyticsQuery } from '../redux/analyticsApi';
import { FaChartLine, FaUsers, FaClipboardList, FaCalendarCheck, FaBook } from 'react-icons/fa';

const TeacherAnalytics = () => {
  const { data: subjects, isLoading: subjectsLoading } = useGetTeacherSubjectsQuery();
  const { data: students, isLoading: studentsLoading } = useGetTeacherStudentsQuery();
  const { data: analytics, isLoading: analyticsLoading } = useGetTeacherAnalyticsQuery();

  // Use real data from API or fallback to empty arrays
  const classPerformance = analytics?.classPerformance || [];
  const weakStudents = analytics?.weakStudents || [];
  const assignmentStats = analytics?.assignmentStats || {
    totalAssignments: 0,
    submitted: 0,
    pending: 0,
    averageScore: 0,
    completionRate: 0
  };
  const attendanceReports = analytics?.attendanceReports || [];
  const subjectPerformance = analytics?.subjectPerformance || [];

  if (subjectsLoading || studentsLoading || analyticsLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
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

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-text mb-6">Teacher Analytics</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow-sm border border-border bg-card-alt bg-blue-50">
            <div className="flex items-center">
              <FaChartLine className="text-blue-600 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Class Performance</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {classPerformance.length > 0 ? Math.round(classPerformance.reduce((acc, cls) => acc + cls.averageScore, 0) / classPerformance.length) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border border-border bg-card-alt bg-red-50">
            <div className="flex items-center">
              <FaUsers className="text-red-600 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Weak Students</h3>
                <p className="text-2xl font-bold text-red-600">{weakStudents.length}</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border border-border bg-card-alt bg-green-50">
            <div className="flex items-center">
              <FaClipboardList className="text-green-600 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Assignments</h3>
                <p className="text-2xl font-bold text-green-600">{assignmentStats.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg shadow-sm border border-border bg-card-alt bg-purple-50">
            <div className="flex items-center">
              <FaCalendarCheck className="text-purple-600 text-2xl mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-text mb-1">Attendance</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {attendanceReports.length > 0 ? Math.round(attendanceReports.reduce((acc, month) => acc + month.attendance, 0) / attendanceReports.length) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Performance */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaChartLine className="text-blue-600 mr-2" />
              Class Performance
            </h2>
            <div className="space-y-4">
              {classPerformance.map((cls, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-card-alt rounded-lg">
                  <div>
                    <h3 className="font-semibold text-text">{cls.className}</h3>
                    <p className="text-sm text-text-muted">{cls.totalStudents} students</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{cls.averageScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Students */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaUsers className="text-red-600 mr-2" />
              Weak Students
            </h2>
            <div className="space-y-4">
              {weakStudents.map((student, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-card-alt rounded-lg">
                  <div>
                    <h3 className="font-semibold text-text">{student.name}</h3>
                    <p className="text-sm text-text-muted">Class: {student.class}</p>
                    <p className="text-xs text-red-600">Subjects: {student.subjects.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{student.averageScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Statistics */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaClipboardList className="text-green-600 mr-2" />
              Assignment Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-card-alt rounded-lg">
                <p className="text-2xl font-bold text-green-600">{assignmentStats.totalAssignments}</p>
                <p className="text-sm text-text-muted">Total</p>
              </div>
              <div className="text-center p-4 bg-card-alt rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{assignmentStats.submitted}</p>
                <p className="text-sm text-text-muted">Submitted</p>
              </div>
              <div className="text-center p-4 bg-card-alt rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{assignmentStats.pending}</p>
                <p className="text-sm text-text-muted">Pending</p>
              </div>
              <div className="text-center p-4 bg-card-alt rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{assignmentStats.averageScore}%</p>
                <p className="text-sm text-text-muted">Avg Score</p>
              </div>
            </div>
          </div>

          {/* Attendance Reports */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaCalendarCheck className="text-purple-600 mr-2" />
              Attendance Reports
            </h2>
            <div className="space-y-4">
              {attendanceReports.map((report, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-card-alt rounded-lg">
                  <h3 className="font-semibold text-text">{report.month}</h3>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${report.attendance}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-bold text-purple-600">{report.attendance}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
              <FaBook className="text-indigo-600 mr-2" />
              Subject Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectPerformance.map((subject, index) => (
                <div key={index} className="p-4 bg-card-alt rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-text">{subject.subject}</h3>
                    <p className="text-lg font-bold text-indigo-600">{subject.averageScore}%</p>
                  </div>
                  <p className="text-sm text-text-muted">{subject.totalStudents} students</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${subject.averageScore}%` }}
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

export default TeacherAnalytics;