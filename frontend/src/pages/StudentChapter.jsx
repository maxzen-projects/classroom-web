import React from 'react';
import { useParams } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';

const StudentChapter = () => {
  const { chapterId } = useParams();
  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Chapter Page</h1>
        <p>Chapter ID: {chapterId}</p>
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentChapter;