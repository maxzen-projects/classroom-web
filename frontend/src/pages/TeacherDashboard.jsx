import React from 'react';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import { useGetTeacherSubjectsQuery, useGetTeacherStudentsQuery } from '../redux/teacherApi';
import { Link } from 'react-router-dom';
import { FaChartLine } from 'react-icons/fa';

const TeacherDashboard = () => {
  const { data: subjects, isLoading: subjectsLoading } = useGetTeacherSubjectsQuery();
  const { data: students, isLoading: studentsLoading } = useGetTeacherStudentsQuery();

  const stats = [
    {
      title: 'My Subjects',
      value: subjects?.length || 0,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10'
    },
    {
      title: 'Total Students',
      value: students?.length || 0,
      color: 'text-success',
      bgColor: 'bg-success bg-opacity-10'
    },
    {
      title: 'Active Chapters',
      value: subjects?.reduce((acc, subject) => acc + (subject.chapters?.length || 0), 0) || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600 bg-opacity-10'
    },
    {
      title: 'Pending Tasks',
      value: 0,
      color: 'text-warning',
      bgColor: 'bg-warning bg-opacity-10'
    }
  ];

  if (subjectsLoading || studentsLoading) {
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
        <h1 className="text-3xl font-bold text-text mb-6">Teacher Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`p-6 rounded-lg shadow-sm border border-border bg-card-alt ${stat.bgColor}`}>
              <h3 className="text-lg font-semibold text-text mb-2">{stat.title}</h3>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <h2 className="text-xl font-semibold text-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to={ROUTES.TEACHER_ANALYTICS}
              className="flex items-center p-4 border border-border bg-card-alt rounded-lg hover:shadow-md transition-shadow hover:border-primary"
            >
              <FaChartLine className="text-primary text-xl mr-3" />
              <div>
                <h3 className="font-semibold text-text">View Analytics</h3>
                <p className="text-sm text-text-muted">Class performance & reports</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Subjects */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-xl font-semibold text-text mb-4">My Subjects</h2>
          {subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.slice(0, 6).map((subject) => (
                <div key={subject._id} className="p-4 border border-border bg-card-alt rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-text">{subject.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{subject.description}</p>
                  <p className="text-sm text-primary mt-2">
                    Class: {subject.class?.name} {subject.class?.section}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted">No subjects assigned yet.</p>
          )}
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherDashboard;
