import React, { useState, useEffect } from 'react';
import { useCreateClassMutation, useUpdateClassMutation, useGetTeachersQuery } from '../redux/academicApi';
import Modal from './Modal';
import Loader from './Loader';

const CreateClassModal = ({ classData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    academicYear: '',
    classTeacher: '',
    feeAmount: ''
  });
  const [errors, setErrors] = useState({});

  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const { data: teachers, isLoading: teachersLoading } = useGetTeachersQuery();

  const isEditing = !!classData;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || '',
        section: classData.section || '',
        academicYear: classData.academicYear || '',
        classTeacher: classData.classTeacher?._id || '',
        feeAmount: classData.feeAmount || ''
      });
    }
  }, [classData]);

  const classOptions = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Class name is required';
    if (!formData.section) newErrors.section = 'Section is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';
    if (formData.feeAmount === '') newErrors.feeAmount = 'Fee amount is required';
    if (formData.feeAmount !== '' && isNaN(formData.feeAmount)) newErrors.feeAmount = 'Fee amount must be a number';

    // Validate academic year format
    if (formData.academicYear && !/^\d{4}-\d{2}$/.test(formData.academicYear)) {
      newErrors.academicYear = 'Academic year must be in format YYYY-YY (e.g., 2025-26)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        classTeacher: formData.classTeacher || undefined // Remove empty string
      };

      if (isEditing) {
        await updateClass({ id: classData._id, data: submitData }).unwrap();
      } else {
        await createClass(submitData).unwrap();
      }

      onSuccess();
    } catch (error) {
      const errorMessage = error.data?.message || 'An error occurred';
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? 'Edit Class' : 'Create New Class'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Class Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Name *
          </label>
          <select
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Select Class</option>
            {classOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section *
          </label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleInputChange}
            placeholder="e.g., A, B, C"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.section ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            maxLength={10}
          />
          {errors.section && (
            <p className="mt-1 text-sm text-red-600">{errors.section}</p>
          )}
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year *
          </label>
          <input
            type="text"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleInputChange}
            placeholder="e.g., 2025-26"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.academicYear ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.academicYear && (
            <p className="mt-1 text-sm text-red-600">{errors.academicYear}</p>
          )}
        </div>

        {/* Fee Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fee Amount *
          </label>
          <input
            type="number"
            name="feeAmount"
            value={formData.feeAmount}
            onChange={handleInputChange}
            placeholder="e.g., 5000"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.feeAmount ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
            min="0"
          />
          {errors.feeAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.feeAmount}</p>
          )}
        </div>

        {/* Class Teacher */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Teacher
          </label>
          <select
            name="classTeacher"
            value={formData.classTeacher}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading || teachersLoading}
          >
            <option value="">Select Teacher (Optional)</option>
            {teachers?.teachers?.map(teacher => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
          {teachersLoading && (
            <p className="mt-1 text-sm text-gray-500">Loading teachers...</p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
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
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && <Loader size="sm" className="mr-2" />}
            {isEditing ? 'Update Class' : 'Create Class'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClassModal;
