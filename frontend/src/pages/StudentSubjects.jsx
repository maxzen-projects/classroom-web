import React from 'react';
import { useGetStudentSubjectsQuery } from '../redux/academicApi';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

const StudentSubjects = () => {
  const { data: subjects, isLoading, error } = useGetStudentSubjectsQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Subjects</h1>
            <p className="text-red-600">Error loading subjects: {error.message}</p>
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <button
            onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subjectAssignment) => (
              <div
                key={subjectAssignment._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/student/subject/${subjectAssignment.subjectId?._id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {subjectAssignment.subjectId?.name}
                  </h3>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {subjectAssignment.subjectId?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Teacher:</span> {subjectAssignment.teacherId?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {subjectAssignment.teacherId?.email}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/subject/${subjectAssignment.subjectId?._id}`);
                    }}
                  >
                    View Subject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Subjects Assigned"
            description="You haven't been assigned to any subjects yet. Please contact your teacher or administrator."
            icon="📚"
          />
        )}
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentSubjects;
