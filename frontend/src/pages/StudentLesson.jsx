import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetLessonByIdQuery } from '../redux/academicApi';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { UPLOADS_BASE_URL } from '../redux/baseApi';

const StudentLesson = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { data: lesson, isLoading, error } = useGetLessonByIdQuery(lessonId);
  const [toast, setToast] = useState(null);

  const handlePreviousLesson = () => {
    // This would need to be implemented with lesson ordering logic
    // For now, just go back to the subject chapter list
    navigate(-1);
  };

  const handleNextLesson = () => {
    // This would need to be implemented with lesson ordering logic
    // For now, just go back to the subject chapter list
    navigate(-1);
  };

  const renderLessonContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'video':
        return (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Video Lesson</h2>
            {lesson.videoUrl ? (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full"
                  poster="/api/placeholder/800/450"
                >
                  <source src={`${UPLOADS_BASE_URL}${lesson.videoUrl}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video not available</p>
              </div>
            )}
          </div>
        );

      case 'note':
        return (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Lesson Notes</h2>
            {lesson.fileUrl ? (
              <div className="bg-white border rounded-lg p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4 text-center">
                  <svg className="w-12 h-12 text-blue-600 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Lesson Notes (PDF)</h3>
                  <p className="text-sm text-gray-600 mb-4">Click the button below to view or download your lesson notes</p>
                  <a
                    href={`${UPLOADS_BASE_URL}${lesson.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586 10.293 9.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    View / Download Notes
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-500">Notes not available</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Lesson Content</h2>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-500">Unsupported lesson type: {lesson.type}</p>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <div className="text-center text-red-600">
            Error loading lesson: {error.data?.message || error.message}
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  if (!lesson) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <div className="text-center text-gray-500">
            Lesson not found.
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Lesson Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-600">{lesson.description}</p>
          )}
          <div className="flex items-center mt-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              lesson.type === 'video' ? 'bg-red-100 text-red-800' :
              lesson.type === 'note' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
            </span>
            {lesson.duration && (
              <span className="ml-2 text-sm text-gray-500">
                Duration: {lesson.duration} minutes
              </span>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        {renderLessonContent()}

        {/* Navigation and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t">
          <div className="flex gap-2">
            <button
              onClick={handlePreviousLesson}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Previous Lesson
            </button>
            <button
              onClick={handleNextLesson}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Next Lesson
            </button>
          </div>
        </div>

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

export default StudentLesson;
