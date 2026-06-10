import React, { useState, useEffect } from 'react';
import { useCreateStudentMutation, useUpdateStudentMutation } from '../redux/studentsApi';
import { useGetClassesQuery } from '../redux/academicApi';
import Modal from './Modal';
import Loader from './Loader';

const CreateStudentModal = ({ studentData, onClose, onSuccess }) => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    rollNumber: '',
    parentName: '',
    parentPhone: '',
    class: ''
  });

  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const { data: classes, isLoading: classesLoading } = useGetClassesQuery();

  const isEditing = !!studentData;

  useEffect(() => {
    if (studentData) {
      setFormData({
        name: studentData.name || '',
        email: studentData.email || '',
        password: '',
        phone: studentData.phone || '',   // ✅ ADD THIS
        rollNumber: studentData.rollNumber || '',
        parentName: studentData.parentName || '',
        parentPhone: studentData.parentPhone || '',
        class: studentData.class?._id || ''
      });
    }
  }, [studentData]);

  const validate = () => {
  const nextErrors = {};

  // Name
 if (!formData.name.trim()) {
  nextErrors.name = "Name is required";
} else if (!/^[A-Za-z\s]{2,50}$/.test(formData.name)) {
  nextErrors.name = "Name should contain only letters (min 2 chars)";
}

  // Email
  if (!formData.email.trim()) {
    nextErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    nextErrors.email = "Invalid email format";
  }

 // Student Phone (OPTIONAL)
if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
  nextErrors.phone = "Phone must be 10 digits";
}


  // Password (only when creating)
  if (!isEditing) {
    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(formData.password)
    ) {
      nextErrors.password =
        "Password must be 8+ chars, include uppercase, lowercase, number & special char";
    }
  }



  // Parent Phone (required but must be valid if entered)

if (!formData.parentPhone.trim()) {
  nextErrors.parentPhone = "Parent phone is required";
} else if (!/^\d{10}$/.test(formData.parentPhone)) {
  nextErrors.parentPhone = "Parent phone must be 10 digits";
}

if (
  formData.phone &&
  formData.parentPhone &&
  formData.phone === formData.parentPhone
) {
  nextErrors.parentPhone = "Parent phone cannot be same as student phone";
}


  setErrors(nextErrors);
  return Object.keys(nextErrors).length === 0;
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

     // Clear error for that field
  setErrors(prev => ({
    ...prev,
    [name]: ''
  }));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

      if (!validate()) return;
      
    try {
      const dataToSubmit = {
        ...formData,
        class: formData.class || null
      };

      if (isEditing) {
        await updateStudent({ id: studentData._id, ...dataToSubmit }).unwrap();
      } else {
        await createStudent(dataToSubmit).unwrap();
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
      // Error handling will be done by the parent component
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Modal
      isOpen={true}
      title={isEditing ? 'Edit Student' : 'Add New Student'}
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
              placeholder="Enter student's full name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
           <input
  type="email"
  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full input-field"
              placeholder="Enter email address"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone * 
            </label>
            <input
  type="tel"
  name="phone"
  value={formData.phone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, phone: value }));
  }}
  maxLength={10}
  className="w-full input-field"
/>
{errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
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
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
          )}

          <div>
            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number *
            </label>
            <input
              type="text"
              id="rollNumber"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              className="w-full input-field"
              placeholder="Enter roll number"
            />
            
          </div>

          <div>
            <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
              Parent Name *
            </label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              required
              value={formData.parentName}
              onChange={handleChange}
              className="w-full input-field"
              placeholder="Enter parent's full name"
            />
          </div>

          <div>
            <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Parent Phone *
            </label>
           <input
  type="tel"
  name="parentPhone"
  required
  value={formData.parentPhone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, parentPhone: value }));
  }}
  maxLength={10}
  className="w-full input-field"
/>
{errors.parentPhone && <p className="text-red-500 text-sm">{errors.parentPhone}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
              Class *
            </label>
            {classesLoading ? (
              <Loader />
            ) : (
              <select
                id="class"
                name="class"
                value={formData.class}
                required
                onChange={handleChange}
                className="w-full input-field"
              >
                <option value="">Select a class</option>
                {classes?.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name} {classItem.section}
                  </option>
                ))}
              </select>
            )}
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
              isEditing ? 'Update Student' : 'Create Student'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStudentModal;
