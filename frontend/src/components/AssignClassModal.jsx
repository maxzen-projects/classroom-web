import React, { useState, useEffect } from 'react';
import { useAssignClassMutation } from '../redux/studentsApi';
import { useGetClassesQuery } from '../redux/academicApi';
import Modal from './Modal';
import Loader from './Loader';

const AssignClassModal = ({ studentData, onClose, onSuccess }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [assignClass, { isLoading }] = useAssignClassMutation();
  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();

  useEffect(() => {
    if (studentData?.class?._id) {
      setSelectedClass(studentData.class._id);
    }
  }, [studentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentData?._id) {
    console.error("Student ID missing!");
    return;
  }

    try {
      await assignClass({
        id: studentData._id,
        classId: selectedClass || null
      }).unwrap();

      onSuccess();
    } catch (error) {
      console.error('Error assigning class:', error);
      // Error handling will be done by the parent component
    }
  };

  return (
    <Modal
      isOpen={true}
      title={`Assign Class to ${studentData?.name}`}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          {classesLoading ? (
            <Loader />
          ) : (
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Unassign from current class</option>
              {classes?.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.name} {classItem.section}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Assignment:</h4>
          <p className="text-sm text-gray-600">
            {studentData?.class ? `${studentData.class.name} ${studentData.class.section}` : 'No class assigned'}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader size="sm" />
                <span className="ml-2">Assigning...</span>
              </div>
            ) : (
              'Assign Class'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignClassModal;
