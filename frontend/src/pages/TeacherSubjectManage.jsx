import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetChaptersQuery } from '../redux/academicApi';
import { ROUTES } from '../routes';
import Toast from '../components/Toast';

const TeacherSubjectManage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const { data: chapters, isLoading: chaptersLoading } = useGetChaptersQuery(subjectId);

  if (chaptersLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">Loading subject...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Subject</h1>
          <p className="text-gray-600 mt-1">Subject ID: {subjectId}</p>
        </div>
        <div className="flex space-x-4">
          <Link
            to={ROUTES.TEACHER_CREATE_CHAPTER}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Chapter
          </Link>
        </div>
      </div>

      {/* Subject Structure */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Chapters</h2>
          <Link
            to={ROUTES.TEACHER_CREATE_CHAPTER}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Chapter
          </Link>
        </div>

        {chaptersLoading ? (
          <div className="text-center">Loading chapters...</div>
        ) : chapters && chapters.length > 0 ? (
          <div className="space-y-4">
            {chapters.map(chapter => (
              <div key={chapter._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{chapter.title}</h3>
                    {chapter.description && (
                      <p className="text-gray-600 mt-1">{chapter.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      chapter.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {chapter.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No chapters added yet. <Link to={ROUTES.TEACHER_CREATE_CHAPTER} className="text-blue-600 hover:text-blue-800">Add your first chapter</Link>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default TeacherSubjectManage;
