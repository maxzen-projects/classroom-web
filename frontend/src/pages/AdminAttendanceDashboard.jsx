import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaSchool, FaUsers, FaCheckCircle, FaTimesCircle, FaClock, FaFilter, FaSync } from 'react-icons/fa';
import DashboardCard from '../components/DashboardCard';
import CalendarView from '../components/CalendarView';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import {
  useGetAdminAttendanceStatsQuery,
  useGetAttendanceClassesQuery,
  useGetAdminAttendanceCalendarQuery,
} from '../redux/attendanceApi';
import { useAuth } from '../context/AuthContext';

const AdminAttendanceDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClassId, setSelectedClassId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);

  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useGetAdminAttendanceStatsQuery({
    date: selectedDate,
  });

  const { data: classes = [], isLoading: classesLoading, error: classesError } = useGetAttendanceClassesQuery();
  const { data: calendarData, isLoading: calendarLoading, error: calendarError } = useGetAdminAttendanceCalendarQuery({
    month: new Date(selectedDate).getMonth() + 1,
    year: new Date(selectedDate).getFullYear(),
  });

  // Handle errors
  if (statsError || classesError || calendarError) {
    console.error('API Error:', { statsError, classesError, calendarError });
  }

  useEffect(() => {
    refetchStats();
  }, [selectedDate, refetchStats]);

  const showToast = (type, message) => setToast({ type, message });

  const handleRefresh = () => {
    refetchStats();
    showToast('success', 'Data refreshed successfully');
  };

  const attendanceCards = [
    {
      title: 'Total Classes',
      value: stats?.totalClasses || 0,
      icon: FaSchool,
      color: 'blue',
      description: 'Active classes in school'
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: FaUsers,
      color: 'green',
      description: 'Total enrolled students'
    },
    {
      title: 'Present',
      value: stats?.totalPresent || 0,
      icon: FaCheckCircle,
      color: 'success',
      description: 'Students marked present'
    },
    {
      title: 'Absent',
      value: stats?.totalAbsent || 0,
      icon: FaTimesCircle,
      color: 'danger',
      description: 'Students marked absent'
    },
    {
      title: 'Late',
      value: stats?.totalLate || 0,
      icon: FaClock,
      color: 'warning',
      description: 'Students marked late'
    },
    {
      title: 'Unmarked',
      value: stats?.unmarkedStudents || 0,
      icon: FaUsers,
      color: 'secondary',
      description: 'Students not marked yet'
    },
  ];

  if (statsLoading || classesLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Attendance Dashboard</h1>
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="btn-outline flex items-center gap-2"
          disabled={statsLoading}
        >
          <FaSync className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters Section */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text">Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center gap-2"
          >
            <FaFilter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-field"
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Filter by Class (Optional)
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="input-field"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} {cls.section}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {attendanceCards.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            description={card.description}
          />
        ))}
      </div>

      {/* Attendance Calendar */}
      <div className="mb-6">
        <CalendarView
          role="admin"
          events={calendarData?.events || []}
          onSelectEvent={(event) => {
            // Handle calendar event click - could show detailed attendance for that date
            const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
            setSelectedDate(eventDate);
            showToast('info', `Selected date: ${format(new Date(event.date), 'MMMM dd, yyyy')}`);
          }}
        />
      </div>

      {/* Session-less Mode Message */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <FaCheckCircle className="w-5 h-5 text-success" />
          <h2 className="text-lg font-semibold text-text">Attendance Management</h2>
        </div>
        
        <div className="bg-info-soft p-4 rounded-lg text-info">
          <p className="text-sm"><strong>Session-less Mode:</strong> Attendance is now marked directly by teachers or students without fixed time windows.</p>
          <p className="text-sm mt-2">Use the individual class attendance pages for detailed management.</p>
        </div>
      </div>

      {/* Summary Information */}
      {stats && (
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-text mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success-soft p-4 rounded-lg">
              <p className="text-sm text-success font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-text mt-1">
                {stats.totalStudents > 0 
                  ? Math.round(((stats.totalPresent + stats.totalLate) / stats.totalStudents) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-primary-soft p-4 rounded-lg">
              <p className="text-sm text-primary font-medium">Marked Attendance</p>
              <p className="text-2xl font-bold text-text mt-1">
                {stats.totalMarked} / {stats.totalStudents}
              </p>
            </div>
            <div className="bg-warning-soft p-4 rounded-lg">
              <p className="text-sm text-warning font-medium">Pending</p>
              <p className="text-2xl font-bold text-text mt-1">
                {stats.unmarkedStudents} students
              </p>
            </div>
          </div>
        </div>
      )}

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

export default AdminAttendanceDashboard;
