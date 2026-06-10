import React, { useState } from 'react';

const AttendanceModal = ({ liveClass, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!liveClass) return null;

  // Mock student data - in real app, this would come from enrolled students
  const mockStudents = [
    { _id: '1', name: 'John Doe', email: 'john@example.com' },
    { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { _id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
    { _id: '4', name: 'Alice Brown', email: 'alice@example.com' },
    { _id: '5', name: 'Charlie Wilson', email: 'charlie@example.com' },
  ];

  // Combine mock students with actual attendees
  const studentsWithAttendance = mockStudents.map(student => {
    const attendee = liveClass.attendees?.find(a => a.user.toString() === student._id);
    return {
      ...student,
      joinedAt: attendee?.joinedAt,
      leftAt: attendee?.leftAt,
      duration: attendee?.duration || 0,
    };
  });

  const filteredStudents = studentsWithAttendance.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAttendanceStatus = (student) => {
    if (!student.joinedAt) return { status: 'Absent', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (!student.leftAt) return { status: 'Joined', color: 'text-green-600', bgColor: 'bg-green-100' };
    return { status: 'Completed', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  };

  const totalAssigned = mockStudents.length;
  const totalJoined = studentsWithAttendance.filter(s => s.joinedAt).length;
  const totalCompleted = studentsWithAttendance.filter(s => s.leftAt).length;
  const attendanceRate = totalAssigned > 0 ? Math.round((totalJoined / totalAssigned) * 100) : 0;

  const exportAttendance = () => {
    const csvContent = [
      ['Student Name', 'Email', 'Status', 'Join Time', 'Leave Time', 'Duration (minutes)'],
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        getAttendanceStatus(student).status,
        formatTime(student.joinedAt),
        formatTime(student.leftAt),
        student.duration
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${liveClass.title}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Class Attendance</h3>
          <p className="text-gray-600 mt-1">{liveClass.title}</p>
        </div>
        <button
          onClick={exportAttendance}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586 11.293 8.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{totalAssigned}</div>
          <div className="text-sm text-blue-800">Total Students</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{totalJoined}</div>
          <div className="text-sm text-green-800">Joined</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{totalCompleted}</div>
          <div className="text-sm text-purple-800">Completed</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{attendanceRate}%</div>
          <div className="text-sm text-orange-800">Attendance Rate</div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredStudents.length} of {studentsWithAttendance.length} students
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const attendanceStatus = getAttendanceStatus(student);
                return (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${attendanceStatus.bgColor} ${attendanceStatus.color}`}>
                        {attendanceStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(student.joinedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(student.leftAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.duration > 0 ? formatDuration(student.duration) : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

export default AttendanceModal;