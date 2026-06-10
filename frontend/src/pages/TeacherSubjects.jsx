import React from 'react';
import { Link } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import { useGetTeacherSubjectsQuery } from '../redux/teacherApi';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';

const TeacherSubjects = () => {
  const { data: subjects, isLoading, error } = useGetTeacherSubjectsQuery();

  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
        <div className="p-6">
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
        <div className="p-6">
          <div className="text-center text-red-600">
            Error loading subjects: {error.message}
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
        </div>

        {subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {subject.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {subject.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Class:</span> {subject.class?.name} {subject.class?.section}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={ROUTES.TEACHER_SUBJECT_DETAIL.replace(':subjectId', subject._id)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Manage Subject
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No subjects assigned"
            description="You haven't been assigned any subjects yet. Contact your administrator."
            icon="📚"
          />
        )}
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherSubjects;