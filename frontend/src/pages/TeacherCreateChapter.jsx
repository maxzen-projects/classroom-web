import React, { useState } from 'react';
import { useCreateChapterMutation, useGetSubjectsQuery } from '../redux/academicApi';
import { useNavigate } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import Toast from '../components/Toast';

const TeacherCreateChapter = () => {
  const [formData, setFormData] = useState({ title: '', description: '', subjectId: '' });
  const [toast, setToast] = useState(null);
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjectsQuery();
  const [createChapter, { isLoading }] = useCreateChapterMutation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createChapter(formData).unwrap();
      setToast({ type: 'success', message: 'Chapter created successfully!' });
      setTimeout(() => navigate(ROUTES.TEACHER_DASHBOARD), 1200);
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to create chapter' });
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Chapter</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
            <select name="subjectId" value={formData.subjectId} onChange={handleChange} required disabled={subjectsLoading} className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">{subjectsLoading ? 'Loading subjects...' : 'Select a subject'}</option>
              {subjects?.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name || subject.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chapter Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate(ROUTES.TEACHER_DASHBOARD)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={isLoading || !formData.subjectId} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Chapter'}
            </button>
          </div>
        </form>
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherCreateChapter;
