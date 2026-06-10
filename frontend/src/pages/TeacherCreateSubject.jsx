import React, { useState } from 'react';
import { useCreateSubjectMutation } from '../redux/academicApi';
import { useNavigate } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import Toast from '../components/Toast';

const TeacherCreateSubject = () => {
  const [name, setName] = useState('');
  const [toast, setToast] = useState(null);
  const [createSubject, { isLoading }] = useCreateSubjectMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSubject({ name }).unwrap();
      setToast({ type: 'success', message: 'Subject created successfully!' });
      setTimeout(() => navigate(ROUTES.TEACHER_DASHBOARD), 1200);
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to create subject' });
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Subject</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name *</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter subject name"
          />
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={() => navigate(ROUTES.TEACHER_DASHBOARD)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherCreateSubject;
