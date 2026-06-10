import React, { useState, useEffect } from 'react';
import { useCreateSubjectMutation, useUpdateSubjectMutation } from '../redux/subjectsApi';
import Modal from './Modal';
import Loader from './Loader';

// 📌 AddSubjectModal Component
// Purpose: Form to create or edit subject assignments
// Props: isOpen, onClose, classId, subject (optional), teachers
const AddSubjectModal = ({ isOpen, onClose, classId, subject, teachers }) => {
  const [formData, setFormData] = useState({
    name: '',
    teacherId: ''
  });

  const [errors, setErrors] = useState({});
  const [createSubject, { isLoading: isCreating }] = useCreateSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateSubjectMutation();

  const isEditing = !!subject;

  // ✅ Populate form when editing
  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.subjectId?.name || subject.name || '',
        teacherId: subject.teacherId || subject.teacherId?._id || subject.teacher?._id || ''
      });
    } else {
      setFormData({
        name: '',
        teacherId: ''
      });
    }
    setErrors({});
  }, [subject, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ✅ Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    }

    if (!formData.teacherId) {
      newErrors.teacherId = 'Please select a teacher';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        classId,
        teacherId: formData.teacherId
      };

      if (isEditing) {
        await updateSubject({
          id: subject._id,
          data: { 
            name: formData.name.trim(),
            teacherId: formData.teacherId 
          }
        }).unwrap();
      } else {
        await createSubject(payload).unwrap();
      }

      onClose();
      setErrors({});
    } catch (error) {
      console.error('❌ Error saving subject:', error);
      
      // ✅ Handle API error responses
      if (error.data?.message) {
        setErrors({ 
          submit: error.data.message 
        });
      } else {
        setErrors({ 
          submit: 'Failed to save subject. Please try again.' 
        });
      }
    }
  };

  const isLoading = isCreating || isUpdating;

  // 📚 List of common academic subjects
  const commonSubjects = [
    'Telugu',
    'Mathematics',
    'Science',
    'English',
    'Social Studies',
    'Hindi',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Economics',
    'Accountancy',
    'Business Studies',
    'Physical Education',
    'Art',
    'Music',
    'Sanskrit',
    'Marathi',
    'Environmental Science'
  ];

  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? 'Edit Subject' : 'Add New Subject'}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ✅ Subject Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Subject Name <span className="text-red-500">*</span>
          </label>
          
          <select
            id="name-select"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
          >
            <option value="">Select a subject...</option>
            {commonSubjects.map((subjectName) => (
              <option key={subjectName} value={subjectName}>
                {subjectName}
              </option>
            ))}
          </select>

          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter or select subject name"
          />
          
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
          
          <p className="text-xs text-gray-500 mt-1">
            Select from list or enter custom subject name
          </p>
        </div>

        {/* ✅ Teacher Assignment Field */}
        <div>
          <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-2">
            Assign Teacher <span className="text-red-500">*</span>
          </label>
          
          <select
            id="teacherId"
            name="teacherId"
            value={formData.teacherId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.teacherId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a teacher...</option>
            {teachers && teachers.length > 0 ? (
              teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} ({teacher.email})
                </option>
              ))
            ) : (
              <option disabled>No teachers available</option>
            )}
          </select>

          {errors.teacherId && (
            <p className="mt-1 text-sm text-red-500">{errors.teacherId}</p>
          )}
        </div>

        {/* ✅ Server Error Display */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* ✅ Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn-primary text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loader size="sm" />}
            <span>
              {isLoading 
                ? (isEditing ? 'Updating...' : 'Adding...') 
                : (isEditing ? 'Update Subject' : 'Add Subject')
              }
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSubjectModal;