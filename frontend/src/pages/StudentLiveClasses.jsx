import React, { useState } from 'react';
import { useGetStudentLiveClassesQuery, useJoinLiveClassMutation } from '../redux/academicApi';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';

const StudentLiveClasses = () => {
  const { data: liveClasses, isLoading, error } = useGetStudentLiveClassesQuery();
  const [joinLiveClass] = useJoinLiveClassMutation();
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const handleJoinClass = async (classId, meetingLink) => {
    try {
      await joinLiveClass(classId).unwrap();
      if (meetingLink) {
        window.open(meetingLink, '_blank');
      }
      setToast({ type: 'success', message: 'Successfully joined the live class!' });
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to join live class' });
    }
  };

  const subjects = liveClasses
    ? [...new Set(liveClasses
        .map((liveClass) => liveClass.subjectId?.name)
        .filter(Boolean))]
        .map((name) => ({ name }))
    : [];

  // Filter live classes based on search and subject
  const filteredClasses = liveClasses?.filter(liveClass => {
    const matchesSearch = liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liveClass.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liveClass.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || liveClass.subjectId?.name === selectedSubject;
    return matchesSearch && matchesSubject;
  }) || [];

  // Separate upcoming and completed classes
 const upcomingClasses = filteredClasses.filter(c => c.status === 'scheduled');
const ongoingClasses = filteredClasses.filter(c => c.status === 'live');
const completedClasses = filteredClasses.filter(c => c.status === 'completed');

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

const getStatusBadge = (status) => {
  const map = {
    scheduled: { text: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
    ongoing: { text: 'Live Now', color: 'bg-green-100 text-green-800' },
    completed: { text: 'Completed', color: 'bg-gray-100 text-gray-800' },
  };

  return map[status] || map['scheduled'];
};

  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Live Classes</h1>
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Live Classes</h1>
          <div className="text-center text-red-600">
            Error loading live classes: {error.data?.message || error.message}
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Live Classes</h1>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search live classes..."
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
                <option key={index} value={subject.name}>{subject.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Now Classes */}
{ongoingClasses.length > 0 && (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold text-green-700 mb-4">
      Live Now
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ongoingClasses.map((liveClass) => {
        const { date, time } = formatDateTime(liveClass.scheduledAt);
        const status = getStatusBadge(liveClass.status);

        return (
          <div key={liveClass._id} className="bg-white rounded-lg shadow-md p-6 border border-green-200">
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {liveClass.title}
              </h3>
              {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.text}
              </span> */}
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Class:</span>{" "}
                {liveClass.classId ? `${liveClass.classId.name} ${liveClass.classId.section}` : 'N/A'}
              </p>

              <p className="text-sm text-gray-600">
                <span className="font-medium">Subject:</span> {liveClass.subjectId?.name || 'N/A'}
              </p>

              <p className="text-sm text-gray-600">
                <span className="font-medium">Teacher:</span> {liveClass.teacherId?.name}
              </p>
            <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {date}
                      </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Time:</span> {time}
              </p>

               {liveClass.duration && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Duration:</span> {liveClass.duration} minutes
                        </p>
                      )}
            </div>

            <button
              onClick={() =>
                handleJoinClass(
                  liveClass._id,
                  liveClass.meetingUrl || liveClass.meetingLink
                )
              }
              className="w-full py-2 px-4 rounded-md font-medium bg-green-600 text-white hover:bg-green-700"
            >
              Join Now
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}

        {/* Upcoming Classes */}
        {upcomingClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingClasses.map((liveClass) => {
                const { date, time } = formatDateTime(liveClass.scheduledAt);
                const status = getStatusBadge(liveClass.scheduledAt, liveClass.duration);

                return (
                  <div key={liveClass._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{liveClass.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Class:</span> {liveClass.classId ? `${liveClass.classId.name} ${liveClass.classId.section}` : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Subject:</span> {liveClass.subjectId?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Teacher:</span> {liveClass.teacherId?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {date}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Time:</span> {time}
                      </p>
                      {liveClass.duration && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Duration:</span> {liveClass.duration} minutes
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleJoinClass(liveClass._id, liveClass.meetingUrl || liveClass.meetingLink)}
                       disabled={liveClass.status !== 'live'}
                      className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                        status.text === 'Completed'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {liveClass.status === 'live'
  ? 'Join Now'
  : liveClass.status === 'scheduled'
  ? 'Upcoming'
  : 'Completed'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Classes */}
        {completedClasses.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Completed Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedClasses.map((liveClass) => {
                const { date, time } = formatDateTime(liveClass.scheduledAt);

                return (
                  <div key={liveClass._id} className="bg-white rounded-lg shadow-md p-6 opacity-75">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{liveClass.title}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Completed
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Class:</span> {liveClass.classId ? `${liveClass.classId.name} ${liveClass.classId.section}` : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Subject:</span> {liveClass.subjectId?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Teacher:</span> {liveClass.teacherId?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {date}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Time:</span> {time}
                      </p>
                    </div>

                    {liveClass.recordedVideoUrl && (
                      <button
                        onClick={() => window.open(liveClass.recordedVideoUrl, '_blank')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium"
                      >
                        Watch Recording
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredClasses.length === 0 && (
          <EmptyState
            title="No live classes found"
            description={searchTerm || selectedSubject !== 'all'
              ? "Try adjusting your search or filter criteria."
              : "No live classes are scheduled for your class and assigned subjects."
            }
            actionText={searchTerm || selectedSubject !== 'all' ? "Clear filters" : "Check later"}
            onAction={() => {
              if (searchTerm || selectedSubject !== 'all') {
                setSearchTerm('');
                setSelectedSubject('all');
              }
            }}
          />
        )}

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

export default StudentLiveClasses;

