import React, { useState } from 'react';
import { useGetClassesQuery, useDeleteClassMutation } from '../redux/academicApi';
import CreateClassModal from '../components/CreateClassModal';
import AssignTeacherModal from '../components/AssignTeacherModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';

const ManageClasses = () => {
  const { data: classes, isLoading, error, refetch } = useGetClassesQuery();
  const [deleteClass] = useDeleteClassMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [assigningClass, setAssigningClass] = useState(null);
  const [toast, setToast] = useState(null);

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setShowCreateModal(true);
  };

  const handleAssignTeacher = (classItem) => {
    setAssigningClass(classItem);
    setShowAssignModal(true);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        await deleteClass(classId).unwrap();
        setToast({ type: 'success', message: 'Class deleted successfully' });
        refetch();
      } catch (error) {
        setToast({ type: 'error', message: error.data?.message || 'Failed to delete class' });
      }
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowAssignModal(false);
    setEditingClass(null);
    setAssigningClass(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="bg-bg p-6 text-text theme-transition">
        <h1 className="mb-6 text-3xl font-bold text-text">Manage Classes</h1>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg p-6 text-text theme-transition">
        <h1 className="mb-6 text-3xl font-bold text-text">Manage Classes</h1>
        <EmptyState
          title="Error Loading Classes"
          description={error.data?.message || 'Failed to load classes'}
          icon="error"
        />
      </div>
    );
  }

  return (
    <div className="bg-bg p-6 text-text theme-transition">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text">Manage Classes</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {classes && classes.length > 0 ? (
        <div className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-card-alt">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Academic Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Fee Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Class Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Total Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {classes.map((classItem) => (
                  <tr key={classItem._id} className="theme-transition hover:bg-card-alt">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                      {classItem.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {classItem.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {classItem.academicYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text font-semibold">
                      ₹{classItem.feeAmount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {classItem.classTeacher ? classItem.classTeacher.name : 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {classItem.studentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(classItem)}
                          className="theme-transition rounded-lg p-2 text-primary hover:bg-primary-soft hover:text-primary-hover"
                          title="Edit Class"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAssignTeacher(classItem)}
                          className="theme-transition rounded-lg p-2 text-secondary hover:bg-card-alt hover:text-secondary-hover"
                          title="Assign Teacher"
                        >
                          <FaUser className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(classItem._id)}
                          className="theme-transition rounded-lg p-2 text-danger hover:bg-danger-soft hover:text-danger"
                          title="Delete Class"
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
          title="No Classes Found"
          description="Get started by creating your first class"
          icon="school"
        />
      )}

      {showCreateModal && (
        <CreateClassModal
          classData={editingClass}
          onClose={handleModalClose}
          onSuccess={() => {
            setToast({ type: 'success', message: editingClass ? 'Class updated successfully' : 'Class created successfully' });
            handleModalClose();
          }}
        />
      )}

      {showAssignModal && assigningClass && (
        <AssignTeacherModal
          classData={assigningClass}
          onClose={handleModalClose}
          onSuccess={() => {
            setToast({ type: 'success', message: 'Teacher assigned successfully' });
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

export default ManageClasses;
