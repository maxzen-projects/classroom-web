import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaSync } from 'react-icons/fa';
import CalendarView from '../components/CalendarView';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import {
  useMarkIndividualAttendanceMutation,
  useGetStudentAttendanceQuery,
} from '../redux/attendanceApi';
import { useAuth } from '../context/AuthContext';

const StudentAttendancePage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selfStatus, setSelfStatus] = useState('present');
  const [toast, setToast] = useState(null);
  const studentId = user?.id || user?._id;

  // API queries
  const { 
    data: attendanceData, 
    isLoading: attendanceLoading 
  } = useGetStudentAttendanceQuery({
    month: new Date(selectedDate).getMonth() + 1,
    year: new Date(selectedDate).getFullYear(),
    studentId,
  });

  const [markIndividualAttendance, { isLoading: submitting }] = useMarkIndividualAttendanceMutation();

  const showToast = (type, message) => setToast({ type, message });

  const handleMarkAttendance = async () => {
    try {
      // Debug user data
      console.log('User data:', user);
      console.log('User classId:', user?.classId);
      console.log('User class:', user?.class);
      console.log('User schoolId:', user?.schoolId);

      if (!user?.classId && !user?.class) {
        showToast('error', 'You are not assigned to any class');
        return;
      }

      await markIndividualAttendance({
        classId: user.classId || user.class,
        date: selectedDate,
        status: selfStatus,
        method: 'manual'
      }).unwrap();
      
      showToast('success', 'Attendance marked successfully!');
    } catch (error) {
      console.error('Attendance marking error:', error);
      showToast('error', error.data?.message || 'Failed to mark attendance');
    }
  };

  const handleCalendarEventClick = (event) => {
    const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
    setSelectedDate(eventDate);
    showToast('info', `Selected date: ${format(new Date(event.date), 'MMMM dd, yyyy')}`);
  };

  // Prepare calendar data for student
  const calendarEvents = attendanceData?.attendance?.map(record => ({
    date: record.date,
    status: record.status,
    title: `Attendance: ${record.status}`
  })) || [];

  if (attendanceLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Attendance</h1>
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <button
          className="btn-outline flex items-center gap-2"
        >
          <FaSync className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Attendance Calendar */}
      <div className="mb-6">
        <CalendarView
          role="student"
          events={calendarEvents}
          onSelectEvent={handleCalendarEventClick}
        />
      </div>

      {/* Today's Attendance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Status */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-text">
              {format(new Date(selectedDate), 'MMMM dd, yyyy')}
            </h2>
          </div>
          
          <div className="space-y-4">
              <div className="bg-info-soft p-4 rounded-lg">
                <p className="text-info font-medium">Mark Your Attendance</p>
                <p className="text-sm text-text-muted mt-1">
                  Select your attendance status for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Your Status
                </label>
                <select 
                  value={selfStatus}
                  onChange={(e) => setSelfStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
              
              <button 
                onClick={handleMarkAttendance}
                disabled={submitting}
                className="btn-primary w-full justify-center"
              >
                {submitting ? 'Marking...' : 'Mark Attendance'}
              </button>
            </div>
        </div>

        {/* Attendance Summary */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FaCheckCircle className="w-5 h-5 text-success" />
            <h2 className="text-lg font-semibold text-text">Attendance Summary</h2>
          </div>
          
          {attendanceData?.attendance && attendanceData.attendance.length > 0 ? (
            <div className="space-y-4">
              {['present', 'absent', 'late'].map(status => {
                const count = attendanceData.attendance.filter(a => a.status === status).length;
                const percentage = attendanceData.attendance.length > 0 
                  ? Math.round((count / attendanceData.attendance.length) * 100)
                  : 0;
                
                return (
                  <div key={status} className="flex justify-between items-center">
                    <span className="capitalize font-medium">{status}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-muted">{count} days</span>
                      <span className="text-sm font-semibold">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{attendanceData.attendance.length} days</span>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState 
              title="No Attendance Records" 
              description="Your attendance records will appear here" 
            />
          )}
        </div>
      </div>

      {/* Toast Component */}
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

export default StudentAttendancePage;
