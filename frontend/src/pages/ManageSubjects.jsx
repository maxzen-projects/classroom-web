import React, { useState } from 'react';
import { useGetSubjectsQuery, useCreateSubjectMutation, useUpdateSubjectMutation, useDeleteSubjectMutation } from '../redux/subjectsApi';
import { useGetClassesQuery } from '../redux/academicApi';
import { useGetTeachersQuery } from '../redux/teachersApi';
import AddSubjectModal from '../components/AddSubjectModal';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { FaPlus, FaEdit, FaTrash, FaBook, FaExclamationTriangle } from 'react-icons/fa';
// 📌 ManageSubjects Page
// Purpose: Manage Class → Subject → Teacher assignments
// Route: /admin/manage-subjects
const ManageSubjects = () => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [toast, setToast] = useState(null);

  // 🔹 Fetch all classes
  const { data: classes, isLoading: classesLoading, error: classesError } = useGetClassesQuery();
  
  // 🔹 Fetch all teachers
  const { data: teachers, isLoading: teachersLoading } = useGetTeachersQuery();
  
  
  // 🔹 Fetch subjects for selected class (only run if classId is provided)
  const { 
    data: subjects, 
    isLoading: subjectsLoading, 
    error: subjectsError, 
    refetch: refetchSubjects,
    isFetching
  } = useGetSubjectsQuery(
    selectedClassId,
    { skip: !selectedClassId }
  );

  // 🔹 Mutations for CRUD operations
  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();
  const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();

  // ✅ Handle class selection
  const handleClassChange = (classId) => {
    console.log('[ManageSubjects] Class selected:', classId);
    setSelectedClassId(classId);
  };

  // ✅ Open modal to add new subject
  const handleAddSubject = () => {
    setEditingSubject(null);
    setShowAddModal(true);
  };

  // ✅ Open modal to edit existing subject
  const handleEditSubject = (subject) => {
    console.log('[ManageSubjects] Edit subject:', subject._id);
    setEditingSubject(subject);
    setShowAddModal(true);
  };

  // ✅ Delete subject with confirmation
  const handleDeleteSubject = async (subjectId, subjectName) => {
    if (window.confirm(`Are you sure you want to delete "${subjectName}"? This action cannot be undone.`)) {
      try {
        console.log('[ManageSubjects] Deleting subject:', subjectId);
        await deleteSubject(subjectId).unwrap();
        setToast({ 
          type: 'success', 
          message: `Subject "${subjectName}" deleted successfully` 
        });
        refetchSubjects();
      } catch (error) {
        console.error('[ManageSubjects] Delete error:', error);
        setToast({ 
          type: 'error', 
          message: error.data?.message || 'Failed to delete subject' 
        });
      }
    }
  };

  // ✅ Change teacher assignment for a subject
  const handleTeacherChange = async (subjectId, subjectName, teacherId) => {
    if (!teacherId) {
      setToast({ 
        type: 'warning', 
        message: 'Please select a teacher' 
      });
      return;
    }

    try {
      console.log('[ManageSubjects] Updating teacher for subject:', subjectId);
      await updateSubject({
        id: subjectId,
        data: { teacherId }
      }).unwrap();
      
      const selectedTeacher = teachers.find(t => t._id === teacherId);
      setToast({ 
        type: 'success', 
        message: `Teacher "${selectedTeacher?.name}" assigned to "${subjectName}"` 
      });
      refetchSubjects();
    } catch (error) {
      console.error('[ManageSubjects] Update teacher error:', error);
      setToast({ 
        type: 'error', 
        message: error.data?.message || 'Failed to assign teacher' 
      });
    }
  };

  // ✅ Close modal and refresh subjects list
  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingSubject(null);
    refetchSubjects();
  };

  // ✅ Loading state for classes
  if (classesLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Subjects</h1>
        <Loader />
      </div>
    );
  }

  // ✅ Error loading classes
  if (classesError) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Subjects</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-600" />
          <div>
            <p className="text-red-800 font-medium">Error Loading Classes</p>
            <p className="text-red-700 text-sm">{classesError.data?.message || 'Failed to load classes'}</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedClass = classes?.find(c => c._id === selectedClassId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Subjects</h1>
        <p className="text-gray-600 mt-1">
          Assign subjects and teachers to classes
        </p>
      </div>

      {/* 🔹 Class Selector Card */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-3">
          Select Class <span className="text-red-500">*</span>
        </label>
        <select
          id="class-select"
          value={selectedClassId}
          onChange={(e) => handleClassChange(e.target.value)}
          className="block w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">-- Select a class --</option>
          {classes && classes.length > 0 ? (
            classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                Class {classItem.name} - Section {classItem.section} ({classItem.academicYear})
              </option>
            ))
          ) : (
            <option disabled>No classes available</option>
          )}
        </select>
        {classes && classes.length === 0 && (
          <p className="mt-2 text-sm text-yellow-600">
            ⚠️ No classes found. Create classes first before adding subjects.
          </p>
        )}
      </div>

      {/* 🔹 Add Subject Button */}
      {selectedClassId && (
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedClass?.name} - Section {selectedClass?.section}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Academic Year: {selectedClass?.academicYear}
            </p>
          </div>
          <button
            onClick={handleAddSubject}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      )}

      {/* 🔹 Content Area */}
      {!selectedClassId ? (
        <EmptyState
          title="📖 Select a Class"
          description="Choose a class from the dropdown above to manage its subjects and teacher assignments"
          icon="book"
        />
      ) : isFetching ? (
        <div className="flex justify-center items-center py-12">
          <Loader />
        </div>
      ) : subjectsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-600 text-xl flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error Loading Subjects</p>
            <p className="text-red-700 text-sm">{subjectsError.data?.message || 'Failed to load subjects'}</p>
          </div>
        </div>
      ) : subjects && subjects.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* 🔹 Subjects Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Assigned Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map((subject) => {
                  const displayName = subject.subjectId?.name || subject.name || 'Unknown Subject';
                  const assignedTeacherId = subject.teacherId?._id || '';
                  const assignedTeacherEmail = subject.teacherId?.email || subject.teacher?.email || '';

                  return (
                    <tr key={subject._id} className="hover:bg-gray-50 transition">
                      {/* Subject Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FaBook className="text-primary-500 text-sm" />
                          <span className="text-sm font-medium text-gray-900">
                            {displayName}
                          </span>
                        </div>
                      </td>

                      {/* Teacher Dropdown */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={assignedTeacherId}
                          onChange={(e) => handleTeacherChange(subject._id, displayName, e.target.value)}
                          disabled={isUpdating || teachersLoading}
                          className="block px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Teacher</option>
                          {teachers && teachers.length > 0 ? (
                            teachers.map((teacher) => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No teachers available</option>
                          )}
                        </select>
                        {assignedTeacherEmail && (
                          <p className="text-xs text-gray-500 mt-1">
                            {assignedTeacherEmail}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="inline-flex items-center px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                            title="Edit Subject"
                          >
                            <FaEdit className="w-4 h-4 mr-1" />
                            Edit
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSubject(subject._id, displayName)}
                            disabled={isDeleting}
                            className="inline-flex items-center px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Subject"
                          >
                            <FaTrash className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Subjects: <span className="font-semibold">{subjects.length}</span>
            </p>
          </div>
        </div>
      ) : (
        <EmptyState
          title="📚 No Subjects Found"
          description="No subjects have been added to this class yet. Click 'Add Subject' to create one."
          icon="book"
        />
      )}

      {/* 🔹 Add/Edit Subject Modal */}
      {showAddModal && (
        <AddSubjectModal
          isOpen={showAddModal}
          onClose={handleModalClose}
          classId={selectedClassId}
          subject={editingSubject}
          teachers={teachers || []}
        />
      )}

      {/* Toast messages */}
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

export default ManageSubjects;
