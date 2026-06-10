import React, { useState, useEffect } from 'react';
import { useCreateTeacherMutation, useUpdateTeacherMutation } from '../redux/teachersApi';
import Modal from './Modal';
import Loader from './Loader';

const CreateTeacherModal = ({ teacherData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subjectsTeaching: '',
    phone: '',
    qualification: '',
    experience: ''
  });

  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  const isEditing = !!teacherData;

  useEffect(() => {
    if (teacherData) {
      setFormData({
        name: teacherData.name || '',
        email: teacherData.email || '',
        password: '',
        subjectsTeaching: teacherData.subjectsTeaching
  ? teacherData.subjectsTeaching.join(', ')
  : '',
        phone: teacherData.phone || '',
        qualification: teacherData.qualification || '',
        experience: teacherData.experience || ''
      });
    }
  }, [teacherData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        subjectsTeaching: formData.subjectsTeaching
          .split(',')
          .map((subject) => subject.trim())
          .filter(Boolean)
      };

      if (isEditing) {
        await updateTeacher({
  id: teacherData._id,
  data: payload
}).unwrap();
      } else {
        await createTeacher(payload).unwrap();
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving teacher:', error);
      // Error handling will be done by the parent component
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Modal
      isOpen={true}
      title={isEditing ? 'Edit Teacher' : 'Add New Teacher'}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full input-field"
              placeholder="Enter teacher's full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full input-field"
              placeholder="Enter email address"
            />
          </div>

          {!isEditing && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                className="w-full input-field"
                placeholder="Enter password"
              />
            </div>
          )}

          <div>
            <label htmlFor="subjectsTeaching" className="block text-sm font-medium text-gray-700 mb-2">
              Subjects *
            </label>
            <input
  type="text"
  id="subjectsTeaching"
  name="subjectsTeaching"
  value={formData.subjectsTeaching}
  onChange={handleChange}
  required
  className="w-full input-field"
  placeholder="Enter subjects separated by commas"
/>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full input-field"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
              Qualification
            </label>
            <input
              type="text"
              id="qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full input-field"
              placeholder="Enter qualification (e.g., M.Sc. Mathematics)"
            />
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
              Experience (years)
            </label>
            <input
              type="number"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              className="w-full input-field"
              placeholder="Enter years of experience"
            />
          </div>
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
                <span className="ml-2">{isEditing ? 'Updating...' : 'Creating...'}</span>
              </div>
            ) : (
              isEditing ? 'Update Teacher' : 'Create Teacher'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTeacherModal;