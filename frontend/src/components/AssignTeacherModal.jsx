import React, { useState } from 'react';
import { useAssignTeacherMutation, useGetTeachersQuery } from '../redux/academicApi';
import Modal from './Modal';
import Loader from './Loader';

const AssignTeacherModal = ({ classData, onClose, onSuccess }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(classData?.classTeacher?._id || '');
  const [error, setError] = useState('');

  const [assignTeacher, { isLoading }] = useAssignTeacherMutation();
  const { data: teachers, isLoading: teachersLoading } = useGetTeachersQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeacher) {
      setError('Please select a teacher');
      return;
    }

    try {
      await assignTeacher({
        id: classData._id,
        teacherId: selectedTeacher
      }).unwrap();

      onSuccess();
    } catch (error) {
      setError(error.data?.message || 'Failed to assign teacher');
    }
  };

  const selectedTeacherData = teachers?.teachers?.find(t => t._id === selectedTeacher);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Assign Teacher to ${classData?.name} ${classData?.section}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Teacher Info */}
        {classData?.classTeacher && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current Teacher:</strong> {classData.classTeacher.name} ({classData.classTeacher.email})
            </p>
          </div>
        )}

        {/* Teacher Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Teacher *
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => {
              setSelectedTeacher(e.target.value);
              setError('');
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || teachersLoading}
          >
            <option value="">Select Teacher</option>
            {teachers?.teachers?.map(teacher => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
          {teachersLoading && (
            <p className="mt-1 text-sm text-gray-500">Loading teachers...</p>
          )}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Selected Teacher Info */}
        {selectedTeacherData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Selected Teacher:</strong> {selectedTeacherData.name}
            </p>
            <p className="text-sm text-green-700 mt-1">
              Email: {selectedTeacherData.email}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedTeacher}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && <Loader size="sm" className="mr-2" />}
            Assign Teacher
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignTeacherModal;
