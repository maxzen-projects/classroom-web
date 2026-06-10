import React from 'react';

const LiveClassDetailsModal = ({ liveClass, onClose }) => {
  if (!liveClass) return null;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const { date, time } = formatDateTime(liveClass.scheduledAt);
  const endTime = new Date(new Date(liveClass.scheduledAt).getTime() + liveClass.duration * 60000);
  const endTimeFormatted = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      ongoing: { color: 'bg-green-100 text-green-800', label: 'Live Now' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'zoom':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.84 15.24c-.66 0-1.2-.54-1.2-1.2V9.96c0-.66.54-1.2 1.2-1.2h3.6c.66 0 1.2.54 1.2 1.2v3.6c0 .66-.54 1.2-1.2 1.2h-3.6z"/>
          </svg>
        );
      case 'google_meet':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.2 16.8V7.2h2.4v9.6h-2.4z"/>
          </svg>
        );
      case 'microsoft_teams':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.2 16.8V7.2h2.4v9.6h-2.4z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const attendancePercentage = liveClass.attendees?.length > 0
    ? Math.round((liveClass.attendees.filter(a => a.joinedAt).length / liveClass.attendees.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{liveClass.title}</h3>
          <p className="text-gray-600 mt-1">{liveClass.description}</p>
        </div>
        {getStatusBadge(liveClass.status)}
      </div>

      {/* Class Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schedule Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Schedule Information</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{date}</p>
                <p className="text-sm text-gray-600">{time} - {endTimeFormatted}</p>
              </div>
            </div>

            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">Duration: {liveClass.duration} minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Meeting Information</h4>
          <div className="space-y-3">
            <div className="flex items-center">
              {getPlatformIcon(liveClass.platform)}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {liveClass.platform.replace('_', ' ')}
                </p>
                {liveClass.meetingUrl && (
                  <a
                    href={liveClass.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            </div>

            {liveClass.meetingId && (
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Meeting ID</p>
                  <p className="text-sm text-gray-600">{liveClass.meetingId}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject and Teacher Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Subject Information</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900">{liveClass.subjectId?.name || 'N/A'}</h5>
            <p className="text-sm text-gray-600 mt-1">{liveClass.chapterId?.title || 'No chapter selected'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Teacher Information</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900">{liveClass.teacherId?.name}</h5>
            <p className="text-sm text-gray-600 mt-1">{liveClass.teacherId?.email}</p>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Attendance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{liveClass.attendees?.length || 0}</div>
            <div className="text-sm text-blue-800">Total Students Assigned</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {liveClass.attendees?.filter(a => a.joinedAt).length || 0}
            </div>
            <div className="text-sm text-green-800">Students Joined</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{attendancePercentage}%</div>
            <div className="text-sm text-purple-800">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Created By</label>
            <p className="text-sm text-gray-900">{liveClass.teacherId?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created Date</label>
            <p className="text-sm text-gray-900">
              {new Date(liveClass.createdAt).toLocaleDateString()} at{' '}
              {new Date(liveClass.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LiveClassDetailsModal;
