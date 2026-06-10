import React, { useState } from 'react';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import { useGetSchoolsQuery, useDeleteSchoolMutation } from '../redux/schoolApi';
import Modal from '../components/Modal';
import SchoolModal from '../components/SchoolModal';
import AssignAdminModal from '../components/AssignAdminModal';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaUserShield } from 'react-icons/fa';
import { UPLOADS_BASE_URL } from '../redux/baseApi';

const resolveLogoUrl = (logo) => {
  if (!logo) return null;
  if (/^https?:\/\//i.test(logo) || logo.startsWith('data:')) return logo;
  return `${UPLOADS_BASE_URL}${logo.startsWith('/') ? logo : `/${logo}`}`;
};

const ManageSchools = () => {
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [toast, setToast] = useState(null);

  


  // const { data: schools = [], isLoading, error } = useGetSchoolsQuery();
  const { data: schools = [] ,isLoading,
  error } = useGetSchoolsQuery(undefined, {
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
});
  const [deleteSchool] = useDeleteSchoolMutation();

  const handleCreate = () => {
    setSelectedSchool(null);
    setShowSchoolModal(true);
  };

  const handleEdit = (school) => {
    setSelectedSchool(school);
    setShowSchoolModal(true);
  };

  const handleAssignAdmin = (school) => {
    setSelectedSchool(school);
    setShowAssignAdminModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteSchool(id).unwrap();
      setToast({ type: 'success', message: 'School deleted successfully' });
    } catch (err) {
      setToast({ type: 'error', message: err.data?.message || 'Failed to delete school' });
    }
  };

  const handleSuccess = () => {
    setToast({ type: 'success', message: 'Changes saved successfully' });
  };

  return (
    <>
    <RoleProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Schools</h1>
            <p className="mt-2 text-sm text-gray-500">Create, update, delete, and assign admins for schools.</p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            <FaPlus /> Create School
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-6"></div>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-14 mb-3 rounded bg-gray-200" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">Error loading schools.</div>
          ) : schools.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No schools found. Create a new school to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
  School Logo
</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Admin</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {schools.map((school) => (
                    <tr key={school._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{school.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
  {school.logo ? (
    <img
      src={resolveLogoUrl(school.logo)}
      alt={school.name}
      className="h-12 w-12 rounded-full object-cover border"
    />
  ) : (
    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
      N/A
    </div>
  )}
</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.code || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.email || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.phone || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${school.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {school.status || 'inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{school.admin?.name || 'Not Assigned'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                        <button
                          onClick={() => handleEdit(school)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FaEdit /> Edit
                        </button>
                    {school.admin ? (
  <button
    onClick={() => handleAssignAdmin(school)}
    className="inline-flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-100"
  >
    <FaUserShield /> Reassign Admin
  </button>
) : (
  <button
    onClick={() => handleAssignAdmin(school)}
    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
  >
    <FaUserShield /> Assign Admin
  </button>
)}
                        <button
                          onClick={() => handleDelete(school._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

       

        {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} duration={3000} />}
      </div>
    </RoleProtectedRoute>

     <Modal isOpen={showSchoolModal} onClose={() => setShowSchoolModal(false)} title={selectedSchool ? 'Edit School' : 'Create School'} size="lg">
          <SchoolModal
            school={selectedSchool}
            onClose={() => setShowSchoolModal(false)}
            onSuccess={handleSuccess}
          />
        </Modal>

        <Modal isOpen={showAssignAdminModal} onClose={() => setShowAssignAdminModal(false)} title="Assign Admin" size="md">
          {selectedSchool ? (
            <AssignAdminModal
              schoolId={selectedSchool._id}
              schoolName={selectedSchool.name}
              onClose={() => setShowAssignAdminModal(false)}
              onSuccess={handleSuccess}
            />
          ) : null}
        </Modal>
        </>
  );
};

export default ManageSchools;
