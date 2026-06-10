import React, { useState } from 'react';
import { useCreateLessonMutation, useGetChaptersQuery, useGetSubjectsQuery, useUploadLessonFileMutation } from '../redux/academicApi';
import { useNavigate } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import Toast from '../components/Toast';

const TeacherUploadLesson = () => {
  const [formData, setFormData] = useState({ title: '', videoUrl: '', subjectId: '', chapterId: '', order: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [toast, setToast] = useState(null);
  const { data: subjects, isLoading: subjectsLoading } = useGetSubjectsQuery();
  const { data: chapters, isLoading: chaptersLoading } = useGetChaptersQuery(formData.subjectId, { skip: !formData.subjectId });
  const [createLesson, { isLoading }] = useCreateLessonMutation();
  const [uploadFile] = useUploadLessonFileMutation();
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
      let videoUrl = formData.videoUrl;
      if (videoFile) {
        const uploadData = new FormData();
        uploadData.append('file', videoFile);
        const result = await uploadFile({ chapterId: formData.chapterId, formData: uploadData }).unwrap();
        videoUrl = result.fileUrl;
      }

      await createLesson({
        chapterId: formData.chapterId,
        title: formData.title,
        type: 'video',
        videoUrl,
        order: parseInt(formData.order, 10) || 0
      }).unwrap();

      setToast({ type: 'success', message: 'Lesson uploaded successfully!' });
      setTimeout(() => navigate('/teacher/dashboard'), 1200);
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to upload lesson' });
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload Lesson</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <select name="subjectId" value={formData.subjectId} onChange={handleChange} required disabled={subjectsLoading} className="w-full px-4 py-2 border border-gray-300 rounded-md">
            <option value="">{subjectsLoading ? 'Loading subjects...' : 'Select subject'}</option>
            {subjects?.map((subject) => <option key={subject._id} value={subject._id}>{subject.name || subject.title}</option>)}
          </select>
          <select name="chapterId" value={formData.chapterId} onChange={handleChange} required disabled={!formData.subjectId || chaptersLoading} className="w-full px-4 py-2 border border-gray-300 rounded-md">
            <option value="">{formData.subjectId ? 'Select chapter' : 'Select subject first'}</option>
            {chapters?.map((chapter) => <option key={chapter._id} value={chapter._id}>{chapter.title}</option>)}
          </select>
          <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Lesson title" />
          <input type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} className="w-full px-4 py-2 border border-gray-300 rounded-md" />
          <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Or paste video URL" />
          <input type="number" name="order" value={formData.order} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-300 rounded-md" placeholder="Display order" />
          <div className="flex gap-4">
            <button type="submit" disabled={isLoading || !formData.chapterId} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Uploading...' : 'Upload Lesson'}
            </button>
            <button type="button" onClick={() => navigate('/teacher/dashboard')} className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400">Cancel</button>
          </div>
        </form>
        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherUploadLesson;
