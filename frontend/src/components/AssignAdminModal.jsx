import React, { useState } from 'react';
import { useAssignAdminMutation } from '../redux/schoolApi';
import Toast from './Toast';

const AssignAdminModal = ({ schoolId, schoolName, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [assignAdmin] = useAssignAdminMutation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email is required';
    if (!formData.password.trim()) nextErrors.password = 'Password is required';
    if (!formData.phone.trim()) nextErrors.phone = 'Phone is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await assignAdmin({ id: schoolId, data: formData }).unwrap();
      setToast({ type: 'success', message: 'Admin assigned successfully' });
      onSuccess?.();
      setTimeout(() => onClose(), 400);
    } catch (error) {
      setToast({ type: 'error', message: error.data?.message || 'Failed to assign admin' });
    }
  };

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} duration={3000} />}

      <div className="space-y-4">
        <p className="text-sm text-gray-500">Assign an admin for <span className="font-semibold text-gray-900">{schoolName}</span>.</p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Assign Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAdminModal;
