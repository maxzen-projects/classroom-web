import React from 'react';
import { useGetAdminDashboardQuery } from '../redux/adminApi';
import DashboardCard from '../components/DashboardCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { FaSchool, FaUsers, FaChalkboardTeacher, FaCalendarCheck, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

const AdminDashboard = () => {
  const { data, isLoading, error } = useGetAdminDashboardQuery();


  if (isLoading) {
    return (
      <div className="p-6">
       <h1 className="text-3xl font-bold text-gray-900 mb-6">
  {data?.schoolName ? `${data.schoolName} Dashboard` : 'Admin Dashboard'}
</h1>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
       <h1 className="text-3xl font-bold text-gray-900 mb-6">
  {data?.schoolName ? `${data.schoolName} Dashboard` : 'Admin Dashboard'}
</h1>
        <EmptyState
          title="Error Loading Dashboard"
          description={error.data?.message || 'Failed to load dashboard data'}
          icon="error"
        />
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Classes',
      value: data?.totalClasses || 0,
      icon: FaSchool,
      color: 'blue'
    },
    {
      title: 'Total Students',
      value: data?.totalStudents || 0,
      icon: FaUsers,
      color: 'green'
    },
    {
      title: 'Total Teachers',
      value: data?.totalTeachers || 0,
      icon: FaChalkboardTeacher,
      color: 'purple'
    },
    {
      title: 'Attendance %',
      value: `${data?.attendancePercentage || 0}%`,
      icon: FaCalendarCheck,
      color: 'yellow'
    },
    {
      title: 'Fee Collection %',
      value: `${data?.feeCollectionPercentage || 0}%`,
      icon: FaMoneyBillWave,
      color: 'red'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
         {data?.schoolName ? `${data.schoolName} Dashboard` : 'Admin Dashboard'}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to={ROUTES.ADMIN_ANALYTICS}
            className="flex items-center p-4 border border-gray-200 bg-gray-50 rounded-lg hover:shadow-md transition-shadow hover:border-blue-500"
          >
            <FaChartLine className="text-blue-600 text-xl mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-500">School performance & reports</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;