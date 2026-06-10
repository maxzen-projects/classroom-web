import React, { useState } from 'react';
import { useGetTeachersQuery, useDeleteTeacherMutation } from '../redux/teachersApi';
import CreateTeacherModal from '../components/CreateTeacherModal';
import AssignClassesModal from '../components/AssignClassesModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';

const AdminManageTeachers = () => {
  const { data: teachers, isLoading, error, refetch } = useGetTeachersQuery();
  const [deleteTeacher] = useDeleteTeacherMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [toast, setToast] = useState(null);

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowCreateModal(true);
  };

  const handleAssignClasses = (teacher) => {
    setAssigningTeacher(teacher);
    setShowAssignModal(true);
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      try {
        await deleteTeacher(teacherId).unwrap();
        setToast({ type: 'success', message: 'Teacher deleted successfully' });
        refetch();
      } catch (error) {
        setToast({ type: 'error', message: error.data?.message || 'Failed to delete teacher' });
      }
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowAssignModal(false);
    setEditingTeacher(null);
    setAssigningTeacher(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Teachers</h1>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Teachers</h1>
        <EmptyState
          title="Error Loading Teachers"
          description={error.data?.message || 'Failed to load teachers'}
          icon="error"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Teachers</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Teacher
        </button>
      </div>

      {teachers && teachers.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.email}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.subject}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {Array.isArray(teacher.subjectsTeaching)
    ? teacher.subjectsTeaching.join(', ')
    : teacher.subjectsTeaching || 'Not set'}
</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.assignedClasses.map((classItem) => (
                            <span
                              key={classItem._id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {classItem.name} {classItem.section}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'No classes assigned'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Teacher"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAssignClasses(teacher)}
                          className="text-green-600 hover:text-green-900"
                          title="Assign Classes"
                        >
                          <FaUser className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Teacher"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Teachers Found"
          description="Get started by adding your first teacher"
          icon="users"
        />
      )}

      {showCreateModal && (
        <CreateTeacherModal
          teacherData={editingTeacher}
          onClose={handleModalClose}
          onSuccess={() => {
            setToast({ type: 'success', message: editingTeacher ? 'Teacher updated successfully' : 'Teacher added successfully' });
            handleModalClose();
          }}
        />
      )}

      {showAssignModal && assigningTeacher && (
        <AssignClassesModal
          teacherData={assigningTeacher}
          onClose={handleModalClose}
          onSuccess={() => {
            setToast({ type: 'success', message: 'Classes assigned successfully' });
            handleModalClose();
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
  );
};

export default AdminManageTeachers;
