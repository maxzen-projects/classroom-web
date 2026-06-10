import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import {
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useUploadLessonFileMutation
} from '../redux/teacherApi';
import { UPLOADS_BASE_URL } from '../redux/baseApi';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const TeacherChapterDetail = () => {
  const { chapterId } = useParams();
  const { data: lessons, isLoading, refetch } = useGetLessonsQuery(chapterId);
  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();

  const [activeTab, setActiveTab] = useState('videos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'video',
    videoUrl: '',
    fileUrl: '',
    order: 0
  });
  const [toast, setToast] = useState(null);
  const [uploadLessonFile] = useUploadLessonFileMutation();

  const filteredLessons = lessons?.filter(lesson => lesson.type === activeTab.slice(0, -1)) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (videoFile && formData.type === 'video') {
        const uploadData = new FormData();
        uploadData.append('file', videoFile);
        const result = await uploadLessonFile({ chapterId, formData: uploadData }).unwrap();
        payload.videoUrl = result.fileUrl;
      }

      if (documentFile && formData.type === 'note') {
        const uploadData = new FormData();
        uploadData.append('file', documentFile);
        const result = await uploadLessonFile({ chapterId, formData: uploadData }).unwrap();
        payload.fileUrl = result.fileUrl;
      }

      if (editingLesson) {
        await updateLesson({
          id: editingLesson._id,
          data: payload
        }).unwrap();
        setToast({ type: 'success', message: 'Lesson updated successfully' });
      } else {
        await createLesson({
          chapterId,
          ...payload
        }).unwrap();
        setToast({ type: 'success', message: 'Lesson created successfully' });
      }

      setIsModalOpen(false);
      setEditingLesson(null);
      setVideoFile(null);
      setDocumentFile(null);
      setFormData({
        title: '',
        type: 'video',
        videoUrl: '',
        fileUrl: '',
        order: 0
      });
      refetch();
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'An error occurred' });
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setVideoFile(null);
    setDocumentFile(null);
    setFormData({
      title: lesson.title,
      type: lesson.type,
      videoUrl: lesson.videoUrl || '',
      fileUrl: lesson.fileUrl || '',
      order: lesson.order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await deleteLesson(lessonId).unwrap();
        setToast({ type: 'success', message: 'Lesson deleted successfully' });
        refetch();
      } catch (error) {
        setToast({ type: 'error', message: error.data?.message || 'An error occurred' });
      }
    }
  };

  const openCreateModal = (type) => {
    setEditingLesson(null);
    setVideoFile(null);
    setDocumentFile(null);
    setFormData({
      title: '',
      type,
      videoUrl: '',
      fileUrl: '',
      order: filteredLessons.length
    });
    setIsModalOpen(true);
  };

  const tabs = [
    { id: 'videos', label: 'Videos', type: 'video' },
    { id: 'notes', label: 'Notes', type: 'note' }
  ];

  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
        <div className="p-6">
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Chapter Management</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => openCreateModal(activeTab === 'videos' ? 'video' : 'note')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add {activeTab === 'videos' ? 'Video' : 'Note'}
          </button>
        </div>

        <div className="space-y-4">
          {filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => (
              <div key={lesson._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {lesson.type === 'video' ? (
                        lesson.videoUrl ? (
                          <a
                            href={`${UPLOADS_BASE_URL}${lesson.videoUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Video
                          </a>
                        ) : (
                          'No video URL provided'
                        )
                      ) : (
                        lesson.fileUrl ? (
                          <a
                            href={`${UPLOADS_BASE_URL}${lesson.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Notes
                          </a>
                        ) : (
                          'No file URL provided'
                        )
                      )}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(lesson)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lesson._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No {activeTab.slice(0, -1)}s added yet.
              </p>
              <button
                onClick={() => openCreateModal(activeTab === 'videos' ? 'video' : 'note')}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add First {activeTab === 'videos' ? 'Video' : 'Note'}
              </button>
            </div>
          )}
        </div>

        {/* Modal for Create/Edit Lesson */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingLesson(null);
            setVideoFile(null);
            setDocumentFile(null);
            setFormData({
              title: '',
              type: 'video',
              videoUrl: '',
              fileUrl: '',
              order: 0
            });
          }}
          title={editingLesson ? 'Edit Lesson' : `Create ${formData.type === 'video' ? 'Video' : 'Note'}`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {formData.type === 'video' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {videoFile && (
                  <p className="text-sm text-gray-600 mt-2">Selected file: {videoFile.name}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">Or enter video URL</p>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Notes File
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {documentFile && (
                  <p className="text-sm text-gray-600 mt-2">Selected file: {documentFile.name}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">Or enter file URL</p>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/notes.pdf"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLesson(null);
                  setVideoFile(null);
                  setDocumentFile(null);
                  setFormData({
                    title: '',
                    type: 'video',
                    videoUrl: '',
                    fileUrl: '',
                    order: 0
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingLesson ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherChapterDetail;