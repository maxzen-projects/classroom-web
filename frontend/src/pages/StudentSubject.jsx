import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetChaptersQuery, useGetLessonsForChapterQuery } from '../redux/academicApi';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import EmptyState from '../components/EmptyState';

// Separate component for chapter content to handle hooks properly
const ChapterContent = ({ chapter, navigate }) => {
  const { data: lessons, isLoading: lessonsLoading, error: lessonsError } = useGetLessonsForChapterQuery(chapter._id);

  if (lessonsLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (lessonsError) {
    return (
      <div className="text-red-600 py-2">
        Error loading lessons: {lessonsError.message}
      </div>
    );
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-gray-500 py-2">
        No lessons available for this chapter
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {lessons.map((lesson) => (
        <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {lesson.type === 'video' ? (
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
              <p className="text-sm text-gray-600 capitalize">{lesson.type}</p>
            </div>
          </div>
          <button
            onClick={() => navigate(ROUTES.STUDENT_LESSON.replace(':lessonId', lesson._id))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View
          </button>
        </div>
      ))}
    </div>
  );
};

const StudentSubject = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const { data: chapters, isLoading: chaptersLoading, error: chaptersError } = useGetChaptersQuery(subjectId);


  if (chaptersError) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-red-600">Error loading chapters: {chaptersError.message}</div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Subject Details</h1>
          </div>

          {!chapters || chapters.length === 0 ? (
            <EmptyState
              title="No Chapters Available"
              description="This subject doesn't have any chapters yet."
            />
          ) : (
            <div className="space-y-6">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{chapter.title}</h2>
                    {chapter.description && (
                      <p className="text-gray-600 mt-2">{chapter.description}</p>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lessons</h3>
                    <ChapterContent chapter={chapter} navigate={navigate} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentSubject;
