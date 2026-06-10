import React, { useState } from 'react';
import { useGetVideoLessonsQuery } from '../redux/academicApi';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES, ROUTES } from '../routes';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const StudentRecordedVideos = () => {
  const { data: videos, isLoading, error } = useGetVideoLessonsQuery();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const handleWatchVideo = (lessonId) => {
    navigate(ROUTES.STUDENT_LESSON.replace(':lessonId', lessonId));
  };

  // Get unique subjects from videos
  const subjects = videos ? [...new Set(videos.map(video =>
    video.chapterId?.subjectId?.title
  ).filter(Boolean))].map(title => ({ title })) : [];

  // Filter videos based on search and subject
  const filteredVideos = videos?.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.chapterId?.subjectId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' ||
                          video.chapterId?.subjectId?.title === selectedSubject;
    return matchesSearch && matchesSubject;
  }) || [];

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Recorded Videos</h1>
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Recorded Videos</h1>
          <div className="text-center text-red-600">
            Error loading videos: {error.data?.message || error.message}
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Recorded Videos</h1>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject, index) => (
                <option key={index} value={subject.title}>{subject.title}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Video Thumbnail Placeholder */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <p className="text-sm">Video</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {video.title}
                  </h3>

                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Subject:</span> {video.chapterId?.subjectId?.title || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Chapter:</span> {video.chapterId?.title || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span> {formatDuration(video.duration)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleWatchVideo(video._id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Watch Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recorded videos found"
            description={searchTerm || selectedSubject !== 'all'
              ? "Try adjusting your search or filter criteria."
              : "No recorded videos are available for your subjects."
            }
            actionText={searchTerm || selectedSubject !== 'all' ? "Clear filters" : "Browse subjects"}
            onAction={() => {
              if (searchTerm || selectedSubject !== 'all') {
                setSearchTerm('');
                setSelectedSubject('all');
              } else {
                navigate(ROUTES.STUDENT_SUBJECTS);
              }
            }}
          />
        )}
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentRecordedVideos;
