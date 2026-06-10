import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import {
  useGetChaptersQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation
} from '../redux/teacherApi';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const TeacherSubjectDetail = () => {
  const { subjectId } = useParams();
  const { data: chapters, isLoading, refetch } = useGetChaptersQuery(subjectId);
  const [createChapter] = useCreateChapterMutation();
  const [updateChapter] = useUpdateChapterMutation();
  const [deleteChapter] = useDeleteChapterMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', order: 0 });
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingChapter) {
        await updateChapter({
          id: editingChapter._id,
          data: formData
        }).unwrap();
        setToast({ type: 'success', message: 'Chapter updated successfully' });
      } else {
        await createChapter({
          subjectId,
          ...formData
        }).unwrap();
        setToast({ type: 'success', message: 'Chapter created successfully' });
      }
      setIsModalOpen(false);
      setEditingChapter(null);
      setFormData({ title: '', description: '', order: 0 });
      refetch();
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'An error occurred' });
    }
  };

  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      description: chapter.description,
      order: chapter.order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter? This will also delete all associated lessons.')) {
      try {
        await deleteChapter(chapterId).unwrap();
        setToast({ type: 'success', message: 'Chapter deleted successfully' });
        refetch();
      } catch (error) {
        setToast({ type: 'error', message: error.data?.message || 'An error occurred' });
      }
    }
  };

  const openCreateModal = () => {
    setEditingChapter(null);
    setFormData({ title: '', description: '', order: chapters?.length || 0 });
    setIsModalOpen(true);
  };

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
            <Link
              to={ROUTES.TEACHER_SUBJECTS}
              className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
            >
              ← Back to Subjects
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Chapter
          </button>
        </div>

        <div className="space-y-4">
          {chapters && chapters.length > 0 ? (
            chapters.map((chapter) => (
              <div key={chapter._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {chapter.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{chapter.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={ROUTES.TEACHER_CHAPTER_DETAIL.replace(':chapterId', chapter._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Manage Lessons
                    </Link>
                    <button
                      onClick={() => handleEdit(chapter)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(chapter._id)}
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
              <p className="text-gray-500 text-lg">No chapters created yet.</p>
              <button
                onClick={openCreateModal}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create First Chapter
              </button>
            </div>
          )}
        </div>

        {/* Modal for Create/Edit Chapter */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingChapter(null);
            setFormData({ title: '', description: '', order: 0 });
          }}
          title={editingChapter ? 'Edit Chapter' : 'Create Chapter'}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
                  setEditingChapter(null);
                  setFormData({ title: '', description: '', order: 0 });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingChapter ? 'Update' : 'Create'}
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

export default TeacherSubjectDetail;