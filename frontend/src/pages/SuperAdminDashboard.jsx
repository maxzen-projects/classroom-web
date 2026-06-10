import React from 'react';
import { FaSchool, FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useGetDashboardStatsQuery } from '../redux/superAdminApi';

const statCards = [
  { key: 'totalSchools', title: 'Total Schools', icon: FaSchool, iconColor: '#3b82f6' },
  { key: 'activeSchools', title: 'Active Schools', icon: FaCheckCircle, iconColor: '#22c55e' },
  { key: 'inactiveSchools', title: 'Inactive Schools', icon: FaTimesCircle, iconColor: '#ef4444' },
  { key: 'totalAdmins', title: 'Total Admins', icon: FaUserShield, iconColor: '#6366f1' },
  { key: 'totalTeachers', title: 'Total Teachers', icon: FaChalkboardTeacher, iconColor: '#f59e0b' },
  { key: 'totalStudents', title: 'Total Students', icon: FaUserGraduate, iconColor: '#14b8a6' },
];

const SuperAdminDashboard = () => {
  const { data, isLoading, isError } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse bg-white shadow rounded-2xl p-6 space-y-4">
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-16 w-full bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="bg-white shadow rounded-2xl p-6 text-red-600">
          Error loading dashboard statistics. Please refresh or try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of schools, admins, teachers and students.</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
      {/* <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6"> */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="inline-flex items-center justify-center rounded-2xl px-3 py-2 bg-primary bg-opacity-10 mb-4">
                  <Icon className="h-5 w-5" style={{ color: item.iconColor }} />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.12em] text-text-muted">{item.title}</h3>
                <p className="mt-3 text-4xl font-semibold text-text">{data[item.key]}</p>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-border to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* <div className="grid grid-cols-1 gap-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="mt-2 text-sm text-gray-500">Use these links to manage school-level operations.</p>
            <div className="mt-6 grid gap-3">
              <button className="w-full rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-left text-sm font-medium text-blue-700 transition hover:bg-blue-100">Create School</button>
              <button className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50">View Schools</button>
            </div>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            <p className="mt-2 text-sm text-gray-500">This dashboard is protected and available only to users with the <span className="font-semibold">super_admin</span> role.</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
