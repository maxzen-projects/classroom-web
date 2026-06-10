import React, { useState } from 'react';
import { useGetStudentsQuery, useDeleteStudentMutation } from '../redux/studentsApi';
import CreateStudentModal from '../components/CreateStudentModal';
import AssignClassModal from '../components/AssignClassModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';

const AdminManageStudents = () => {
  const { data: students, isLoading, error, refetch } = useGetStudentsQuery();
  const [deleteStudent] = useDeleteStudentMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [toast, setToast] = useState(null);

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowCreateModal(true);
  };

  const handleAssignClass = (student) => {
    setAssigningStudent(student);
    setShowAssignModal(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await deleteStudent(studentId).unwrap();
        setToast({ type: 'success', message: 'Student deleted successfully' });
        refetch();
      } catch (error) {
        setToast({ type: 'error', message: error.data?.message || 'Failed to delete student' });
      }
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowAssignModal(false);
    setEditingStudent(null);
    setAssigningStudent(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Students</h1>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Students</h1>
        <EmptyState
          title="Error Loading Students"
          description={error.data?.message || 'Failed to load students'}
          icon="error"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          // className="btn-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          className="btn-primary gap-2"
        
        >
          <FaPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {students && students.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Name
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
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class ? `${student.class.name} ${student.class.section}` : 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.parentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.parentPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Student"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAssignClass(student)}
                          className="text-green-600 hover:text-green-900"
                          title="Assign Class"
                        >
                          <FaUser className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Student"
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
          title="No Students Found"
          description="Get started by adding your first student"
          icon="users"
        />
      )}

      {showCreateModal && (
        <CreateStudentModal
          studentData={editingStudent}
          onClose={handleModalClose}
          onSuccess={() => {
            setToast({ type: 'success', message: editingStudent ? 'Student updated successfully' : 'Student added successfully' });
            handleModalClose();
          }}
        />
      )}

      {showAssignModal && assigningStudent && (
        <AssignClassModal
          studentData={assigningStudent}
          onClose={handleModalClose}
          onSuccess={() => {
            setToast({ type: 'success', message: 'Class assigned successfully' });
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

export default AdminManageStudents;