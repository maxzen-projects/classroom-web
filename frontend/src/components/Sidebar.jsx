import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBook,
  FaVideo,
  FaPlay,
  FaClipboardList,
  FaChartBar,
  FaCalendarAlt,
  FaUser,
  FaUsers,
  FaSchool,
  FaBars,
  FaTimes,
  FaMoneyBillWave,
  FaFileAlt,
  FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { ROUTES } from '../routes';
import { useGetPermissionsQuery } from '../redux/permissionsApi';

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch permissions for the current user's role
  const { data: permissionsData } = useGetPermissionsQuery(user?.role, {
    skip: !user?.role || user?.role === 'super_admin'
  });

  const userPermissions = permissionsData?.permissions || [];

  // Helper function to check if user has a specific permission
  const hasPermission = (permission) => {
    if (!permission) return true; // No permission required, show by default
    if (user?.role === 'admin' || user?.role === 'super_admin') return true; // Admins have all permissions
    return userPermissions.includes(permission);
  };

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  const studentMenuItems = [
    { path: ROUTES.STUDENT_DASHBOARD, icon: FaTachometerAlt, label: 'Dashboard', permission: 'dashboard' },
    { path: ROUTES.STUDENT_SUBJECTS, icon: FaBook, label: 'My Subjects', permission: null },
    { path: ROUTES.STUDENT_RECORDED_VIDEOS, icon: FaVideo, label: 'Recorded Videos', permission: null },
    { path: ROUTES.STUDENT_LIVE_CLASSES, icon: FaPlay, label: 'Live Classes', permission: 'live-classes' },
    { path: ROUTES.STUDENT_ACADEMICS, icon: FaFileAlt, label: 'Academics', permission: null },
    { path: ROUTES.STUDENT_ANALYTICS, icon: FaChartBar, label: 'Performance Analytics', permission: 'performance' },
    { path: ROUTES.STUDENT_SCHEDULE, icon: FaCalendarAlt, label: 'Schedule', permission: null },
    { path: ROUTES.STUDENT_TIMETABLE, icon: FaCalendarAlt, label: 'Timetable', permission: 'timetable' },
    { path: ROUTES.STUDENT_ATTENDANCE, icon: FaClipboardList, label: 'Attendance', permission: 'attendance' },
    { path: ROUTES.STUDENT_ASSIGNMENTS, icon: FaClipboardList, label: 'Assignments', permission: 'assignments' },
    { path: ROUTES.STUDENT_FEES, icon: FaMoneyBillWave, label: 'My Fees', permission: 'fees' },
    { path: ROUTES.STUDENT_PROFILE, icon: FaUser, label: 'Profile', permission: null },
  ];

  const teacherMenuItems = [
    { path: ROUTES.TEACHER_DASHBOARD, icon: FaTachometerAlt, label: 'Dashboard', permission: 'dashboard' },
    { path: ROUTES.TEACHER_ANALYTICS, icon: FaChartBar, label: 'Analytics', permission: 'analytics' },
    { path: ROUTES.TEACHER_SUBJECTS, icon: FaBook, label: 'My Subjects', permission: null },
    { path: ROUTES.TEACHER_EXAMS, icon: FaFileAlt, label: 'External Exams', permission: 'exams' },
    { path: ROUTES.TEACHER_STUDENTS, icon: FaUsers, label: 'Students', permission: null },
    { path: ROUTES.TEACHER_STUDENT_FEES, icon: FaMoneyBillWave, label: 'Student Fees', permission: 'fees' },
    { path: ROUTES.TEACHER_TIMETABLE, icon: FaCalendarAlt, label: 'Timetable', permission: 'timetable' },
    { path: ROUTES.TEACHER_ATTENDANCE, icon: FaCalendarAlt, label: 'Attendance', permission: 'attendance' },
    { path: ROUTES.TEACHER_ASSIGNMENTS, icon: FaClipboardList, label: 'Assignments', permission: 'assignments' },
    { path: ROUTES.TEACHER_LIVE_CLASSES, icon: FaPlay, label: 'Live Classes', permission: 'live-classes' },
  ];

  const adminMenuItems = [
    { path: ROUTES.ADMIN_DASHBOARD, icon: FaTachometerAlt, label: 'Dashboard', permission: 'dashboard' },
    { path: ROUTES.ADMIN_ANALYTICS, icon: FaChartBar, label: 'Analytics', permission: 'analytics' },
    { path: ROUTES.ADMIN_MANAGE_CLASSES, icon: FaSchool, label: 'Manage Classes', permission: null },
    { path: ROUTES.ADMIN_MANAGE_FEES, icon: FaMoneyBillWave, label: 'Manage Fees', permission: null },
    { path: ROUTES.ADMIN_MANAGE_SUBJECTS, icon: FaBook, label: 'Manage Subjects', permission: null },
    { path: ROUTES.ADMIN_MANAGE_STUDENTS, icon: FaUsers, label: 'Manage Students', permission: null },
    { path: ROUTES.ADMIN_MANAGE_TEACHERS, icon: FaUsers, label: 'Manage Teachers', permission: null },
    { path: ROUTES.ADMIN_MANAGE_LIVE_CLASSES, icon: FaPlay, label: 'Manage Live Classes', permission: null },
    { path: ROUTES.ADMIN_TIMETABLE, icon: FaCalendarAlt, label: 'Timetable', permission: null },
    // { path: ROUTES.ADMIN_MANAGE_REPORTS, icon: FaChartBar, label: 'Manage Reports', permission: null },
    { path: ROUTES.ADMIN_ATTENDANCE, icon: FaCalendarAlt, label: 'Attendance', permission: null },
    { path: ROUTES.ADMIN_ACCESS_MANAGEMENT, icon: FaShieldAlt, label: 'Access Management', permission: null },
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return studentMenuItems.filter(item => hasPermission(item.permission));
      case 'teacher':
        return teacherMenuItems.filter(item => hasPermission(item.permission));
      case 'admin':
        return adminMenuItems;
      case 'super_admin':
        return [
          { path: ROUTES.SUPER_ADMIN_DASHBOARD, icon: FaTachometerAlt, label: 'Dashboard' },
          { path: ROUTES.SUPER_ADMIN_MANAGE_SCHOOLS, icon: FaSchool, label: 'Manage Schools' },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      {/* Overlay for mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`theme-transition fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border bg-card/95 shadow-card backdrop-blur lg:sticky lg:top-16 lg:z-auto ${
          isOpen ? 'w-72' : '-translate-x-full'
        } lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } transition-all duration-300`}
      >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          {!isCollapsed && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Workspace</h2>
              <p className="mt-1 text-lg font-semibold text-text">Navigation</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCollapsed((current) => !current)}
              className="theme-transition hidden rounded-full border border-border bg-card p-2 text-text-muted hover:border-primary hover:bg-primary-soft hover:text-primary lg:block"
            >
              {isCollapsed ? <FaBars className="h-4 w-4" /> : <FaTimes className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={closeSidebar}
              className="theme-transition rounded-full border border-border bg-card p-2 text-text-muted hover:border-primary hover:bg-primary-soft hover:text-primary lg:hidden"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : ''}
                onClick={closeSidebar}
                className={`theme-transition flex items-center rounded-2xl px-4 py-3 text-sm font-medium ${
                  active
                    ? 'bg-primary text-card shadow-card'
                    : 'text-text-muted hover:bg-card-alt hover:text-text'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          {!isCollapsed && (
            <div className="rounded-2xl bg-card-alt px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Theme Ready</p>
              <p className="mt-1 text-sm text-text">The interface now responds to the active color system.</p>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
