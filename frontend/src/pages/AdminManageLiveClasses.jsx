import React, { useState, useEffect } from 'react';
import { useGetAllLiveClassesQuery, useUpdateLiveClassStatusMutation, useAdminDeleteLiveClassMutation, useGetAllSubjectsQuery } from '../redux/academicApi';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import LiveClassFormModal from '../components/LiveClassFormModal';
import LiveClassDetailsModal from '../components/LiveClassDetailsModal';
import AttendanceModal from '../components/AttendanceModal';


const AdminManageLiveClasses = () => {
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' or 'oldest'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedLiveClass, setSelectedLiveClass] = useState(null);

  const { data: liveClasses, isLoading, error, refetch } = useGetAllLiveClassesQuery();
  const { data: subjects } = useGetAllSubjectsQuery();
  const [updateStatus] = useUpdateLiveClassStatusMutation();
  const [deleteLiveClass] = useAdminDeleteLiveClassMutation();

  // Calculate dashboard stats
  const stats = React.useMemo(() => {
    if (!liveClasses) return { total: 0, upcoming: 0, completed: 0, cancelled: 0 };

    const now = new Date();
    return {
      total: liveClasses.length,
      upcoming: liveClasses.filter(lc => lc.status === 'scheduled' && new Date(lc.scheduledAt) > now).length,
      completed: liveClasses.filter(lc => lc.status === 'completed').length,
      cancelled: liveClasses.filter(lc => lc.status === 'cancelled').length,
    };
  }, [liveClasses]);

  // Filter and sort live classes
  const filteredLiveClasses = React.useMemo(() => {
    if (!liveClasses) return [];

    let filtered = liveClasses.filter(liveClass => {
      const matchesSearch = liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          liveClass.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          liveClass.chapterId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          liveClass.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || liveClass.status === selectedStatus;
      const matchesSubject = selectedSubject === 'all' || liveClass.subjectId?._id === selectedSubject;

      return matchesSearch && matchesStatus && matchesSubject;
    });

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduledAt);
      const dateB = new Date(b.scheduledAt);
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [liveClasses, searchTerm, selectedStatus, selectedSubject, sortBy]);

  const handleStatusChange = async (liveClassId, newStatus) => {
    try {
      await updateStatus({ id: liveClassId, status: newStatus }).unwrap();
      setToast({ type: 'success', message: 'Live class status updated successfully' });
      refetch();
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to update status' });
    }
  };

  const handleDelete = async (liveClassId) => {
    if (!window.confirm('Are you sure you want to delete this live class?')) return;

    try {
      await deleteLiveClass(liveClassId).unwrap();
      setToast({ type: 'success', message: 'Live class deleted successfully' });
      refetch();
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to delete live class' });
    }
  };

  const copyMeetingLink = (meetingUrl) => {
    navigator.clipboard.writeText(meetingUrl);
    setToast({ type: 'success', message: 'Meeting link copied to clipboard' });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      ongoing: { color: 'bg-green-100 text-green-800', label: 'Live Now' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <div className="p-6">
          <Loader />
        </div>
      </RoleProtectedRoute>
    );
  }

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-600">Error loading live classes. Please try again.</p>
          </div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Live Classes</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Live Class
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Live Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by title, subject, chapter, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Live Now</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Subjects</option>
                {subjects?.map(subject => (
                  <option key={subject._id} value={subject._id}>{subject.name || subject.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1 rounded ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Card View
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredLiveClasses.length} of {liveClasses?.length || 0} live classes
            </div>
          </div>
        </div>

        {/* Live Classes Display */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLiveClasses.map((liveClass) => {
                    const { date, time } = formatDateTime(liveClass.scheduledAt);
                    const endTime = new Date(new Date(liveClass.scheduledAt).getTime() + liveClass.duration * 60000);
                    const endTimeFormatted = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={liveClass._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{liveClass.title}</div>
                            <div className="text-sm text-gray-500">{liveClass.subjectId?.name}</div>
                            <div className="text-sm text-gray-500">by {liveClass.teacherId?.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{date}</div>
                          <div className="text-sm text-gray-500">{time} - {endTimeFormatted}</div>
                          <div className="text-sm text-gray-500">{liveClass.duration} min</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(liveClass.status)}
                        </td>
                        {/* <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{liveClass.attendees?.length || 0} joined</div>
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedLiveClass(liveClass);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              View
                            </button>
                            {/* <button
                              onClick={() => {
                                setSelectedLiveClass(liveClass);
                                setShowEditModal(true);
                              }}
                              className="text-green-600 hover:text-green-900 text-sm"
                            >
                              Edit
                            </button> */}
                            {liveClass.meetingUrl && (
                              <button
                                onClick={() => copyMeetingLink(liveClass.meetingUrl)}
                                className="text-purple-600 hover:text-purple-900 text-sm"
                              >
                                Copy Link
                              </button>
                            )}
                            {/* <button
                              onClick={() => {
                                setSelectedLiveClass(liveClass);
                                setShowAttendanceModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-900 text-sm"
                            >
                              Attendance
                            </button> */}
                            {/* <select
                              value={liveClass.status}
                              onChange={(e) => handleStatusChange(liveClass._id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="ongoing">Live Now</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select> */}
                            {/* <button
                              onClick={() => handleDelete(liveClass._id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Delete
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLiveClasses.map((liveClass) => {
              const { date, time } = formatDateTime(liveClass.scheduledAt);
              const endTime = new Date(new Date(liveClass.scheduledAt).getTime() + liveClass.duration * 60000);
              const endTimeFormatted = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={liveClass._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{liveClass.title}</h3>
                      <p className="text-sm text-gray-600">{liveClass.subjectId?.name}</p>
                    </div>
                    {getStatusBadge(liveClass.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {liveClass.teacherId?.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {date} at {time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {liveClass.duration} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {liveClass.attendees?.length || 0} students joined
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedLiveClass(liveClass);
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLiveClass(liveClass);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Edit
                    </button>
                    {liveClass.meetingUrl && (
                      <button
                        onClick={() => copyMeetingLink(liveClass.meetingUrl)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      >
                        Copy Link
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedLiveClass(liveClass);
                        setShowAttendanceModal(true);
                      }}
                      className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                    >
                      View Attendance
                    </button>
                    <select
                      value={liveClass.status}
                      onChange={(e) => handleStatusChange(liveClass._id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="ongoing">Live Now</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modals will be added here */}
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}

        {/* Create Live Class Modal */}
        {showCreateModal && (
          <Modal
            title="Create Live Class"
            onClose={() => setShowCreateModal(false)}
            size="lg"
          >
            <LiveClassFormModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false);
                refetch();
                setToast({ type: 'success', message: 'Live class created successfully' });
              }}
            />
          </Modal>
        )}

        {/* Edit Live Class Modal */}
        {showEditModal && selectedLiveClass && (
          <Modal
            title="Edit Live Class"
            onClose={() => setShowEditModal(false)}
            size="lg"
          >
            <LiveClassFormModal
              liveClass={selectedLiveClass}
              onClose={() => setShowEditModal(false)}
              onSuccess={() => {
                setShowEditModal(false);
                refetch();
                setToast({ type: 'success', message: 'Live class updated successfully' });
              }}
            />
          </Modal>
        )}

        {/* View Details Modal */}
        {showDetailsModal && selectedLiveClass && (
          <Modal
            title="Live Class Details"
            onClose={() => setShowDetailsModal(false)}
            size="lg"
          >
            <LiveClassDetailsModal
              liveClass={selectedLiveClass}
              onClose={() => setShowDetailsModal(false)}
            />
          </Modal>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && selectedLiveClass && (
          <Modal
            title="Class Attendance"
            onClose={() => setShowAttendanceModal(false)}
            size="xl"
          >
            <AttendanceModal
              liveClass={selectedLiveClass}
              onClose={() => setShowAttendanceModal(false)}
            />
          </Modal>
        )}
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminManageLiveClasses;
