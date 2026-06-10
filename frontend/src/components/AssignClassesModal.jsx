import React, { useState, useEffect } from 'react';
import { useAssignClassesMutation } from '../redux/teachersApi';
import { useGetClassesQuery } from '../redux/academicApi';
import Modal from './Modal';
import Loader from './Loader';

const AssignClassesModal = ({ teacherData, onClose, onSuccess }) => {
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [assignClasses, { isLoading }] = useAssignClassesMutation();
  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();

  useEffect(() => {
    if (teacherData?.assignedClasses) {
      setSelectedClasses(teacherData.assignedClasses.map(cls => cls._id));
    }
  }, [teacherData]);

  const handleClassToggle = (classId) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAll = () => {
    if (classes) {
      setSelectedClasses(classes.map(cls => cls._id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedClasses([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const teacherId = teacherData?._id || teacherData?.id;
      if (!teacherId) {
        throw new Error('Teacher ID is missing');
      }

      await assignClasses({
        id: teacherId,
        classIds: selectedClasses
      }).unwrap();

      onSuccess();
    } catch (error) {
      console.error('Error assigning classes:', error);
      // Error handling will be done by the parent component
    }
  };

  return (
    <Modal
      isOpen={true}
      title={`Assign Classes to ${teacherData?.name}`}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Classes
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs text-primary-600 hover:text-primary-800"
              >
                Deselect All
              </button>
            </div>
          </div>

          {classesLoading ? (
            <Loader />
          ) : (
            <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
              {classes?.map((classItem) => (
                <div
                  key={classItem._id}
                  className="flex items-center p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    id={`class-${classItem._id}`}
                    checked={selectedClasses.includes(classItem._id)}
                    onChange={() => handleClassToggle(classItem._id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`class-${classItem._id}`}
                    className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {classItem.name} {classItem.section}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Currently Assigned Classes:</h4>
          {teacherData?.assignedClasses && teacherData.assignedClasses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {teacherData.assignedClasses.map((classItem) => (
                <span
                  key={classItem._id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {classItem.name} {classItem.section}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No classes currently assigned</p>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Classes to be Assigned:</h4>
          {selectedClasses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {classes?.filter(cls => selectedClasses.includes(cls._id)).map((classItem) => (
                <span
                  key={classItem._id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-900"
                >
                  {classItem.name} {classItem.section}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-blue-700">No classes selected</p>
          )}
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
              'Assign Classes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignClassesModal;
