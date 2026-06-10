import React, { useState } from 'react';
import { useCreateLessonMutation, useGetChaptersQuery, useGetSubjectsQuery } from '../redux/academicApi';
import { useNavigate } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import Toast from '../components/Toast';

const TeacherUploadNotes = () => {
  const [formData, setFormData] = useState({ title: '', fileUrl: '', subjectId: '', chapterId: '', order: '' });
  const [toast, setToast] = useState(null);
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjectsQuery();
  const { data: chapters, isLoading: chaptersLoading } = useGetChaptersQuery(formData.subjectId, { skip: !formData.subjectId });
  const [createLesson, { isLoading }] = useCreateLessonMutation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'subjectId' ? { chapterId: '' } : {})
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createLesson({
        chapterId: formData.chapterId,
        title: formData.title,
        type: 'note',
        fileUrl: formData.fileUrl,
        order: parseInt(formData.order, 10) || 0
      }).unwrap();
      setToast({ type: 'success', message: 'Notes uploaded successfully!' });
      setTimeout(() => navigate('/teacher/dashboard'), 1200);
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to upload notes' });
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Notes</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <select name="subjectId" value={formData.subjectId} onChange={handleChange} required disabled={subjectsLoading} className="w-full px-4 py-2 border border-gray-300 rounded-md">
            <option value="">{subjectsLoading ? 'Loading subjects...' : 'Select subject'}</option>
            {subjects?.map((subject) => <option key={subject._id} value={subject._id}>{subject.name || subject.title}</option>)}
          </select>
          <select name="chapterId" value={formData.chapterId} onChange={handleChange} required disabled={!formData.subjectId || chaptersLoading} className="w-full px-4 py-2 border border-gray-300 rounded-md">
            <option value="">{formData.subjectId ? 'Select chapter' : 'Select subject first'}</option>
            {chapters?.map((chapter) => <option key={chapter._id} value={chapter._id}>{chapter.title}</option>)}
          </select>
          <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Notes title" />
          <input name="fileUrl" value={formData.fileUrl} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="PDF/document URL or uploaded path" />
          <input type="number" name="order" value={formData.order} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Display order" />
          <div className="flex gap-4">
            <button type="submit" disabled={isLoading || !formData.chapterId} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Uploading...' : 'Upload Notes'}
            </button>
            <button type="button" onClick={() => navigate('/teacher/dashboard')} className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400">Cancel</button>
          </div>
        </form>
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherUploadNotes;
