import React, { useState, useRef, useEffect } from 'react';
import { useGetProfileQuery, useGetProfileByIdQuery, useUpdateProfileMutation, useUpdateProfileByIdMutation } from '../redux/profileApi';
import { UPLOADS_BASE_URL } from '../redux/baseApi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaSave, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { validateStudentProfile } from '../utils/validations';
import { useParams, useNavigate } from 'react-router-dom';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const isEditable = !!studentId;
  const isViewOnly = !studentId;

  const { data: currentProfile, isLoading: currentLoading, error: currentError } = useGetProfileQuery(undefined, { skip: isEditable });
  const { data: studentProfile, isLoading: studentLoading, error: studentError } = useGetProfileByIdQuery(studentId, { skip: !isEditable });
  const [updateProfile, { isLoading: updatingCurrent }] = useUpdateProfileMutation();
  const [updateProfileById, { isLoading: updatingStudent }] = useUpdateProfileByIdMutation();

  const profile = isEditable ? studentProfile : currentProfile;
  const isLoading = isEditable ? studentLoading : currentLoading;
  const error = isEditable ? studentError : currentError;
  const updating = isEditable ? updatingStudent : updatingCurrent;

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      const initialData = {
        ...profile,
        enrolledSubjectsCount: profile?.assignedSubjects?.length || 0,
        joinedDate: profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : '',
        lastLogin: profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : ''
      };
      setFormData(initialData);
      setProfileImagePreview(profile?.profileImage ? `${UPLOADS_BASE_URL}${profile.profileImage}` : null);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    if (!isEditable) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    if (!isEditable) return;
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = validateStudentProfile(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditable) return;

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const submitData = new FormData();

      const updatableFields = studentFields.filter(field => !field.readonly).map(field => field.name);
      Object.keys(formData).forEach(key => {
        if (updatableFields.includes(key) && formData[key] !== null && formData[key] !== undefined) {
          if (formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          } else if (Array.isArray(formData[key])) {
            submitData.append(key, JSON.stringify(formData[key]));
          } else if (typeof formData[key] === 'string' && formData[key].trim() !== '') {
            submitData.append(key, formData[key]);
          }
        }
      });

      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }

      let result;
      if (isEditable) {
        result = await updateProfileById({ userId: studentId, formData: submitData }).unwrap();
      } else {
        result = await updateProfile(submitData).unwrap();
        if (result.user) {
          const updatedUser = { ...user, ...result.user };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (result.user.profileImage) {
            setProfileImagePreview(`${UPLOADS_BASE_URL}${result.user.profileImage}`);
          }
        }
      }

      toast.success('Profile updated successfully!');
      setProfileImage(null);
      if (isEditable) {
        navigate(-1);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      const initialData = {
        ...profile,
        enrolledSubjectsCount: profile?.assignedSubjects?.length || 0,
        joinedDate: profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : '',
        lastLogin: profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : ''
      };
      setFormData(initialData);
      setProfileImage(null);
      setProfileImagePreview(profile?.profileImage ? `${UPLOADS_BASE_URL}${profile.profileImage}` : null);
      setErrors({});
    }
    if (isEditable) {
      navigate(-1);
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    if (isViewOnly) {
      return (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
            {value || '-'}
          </div>
        </div>
      );
    }

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              name={field.name}
              value={value}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              rows={field.rows || 3}
              readOnly={field.readonly}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${field.readonly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {field.maxLength && (
              <p className="text-xs text-gray-500">
                {value.length}/{field.maxLength} characters
              </p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              name={field.name}
              value={value}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'file':
        if (field.name === 'profileImage') {
          return (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={profileImagePreview || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96' fill='none'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23E5E7EB'/%3E%3Cpath d='M48 50c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12zm0 4c-8.284 0-15 6.716-15 15v3h30v-3c0-8.284-6.716-15-15-15z' fill='%239CA3AF'/%3E%3C/svg%3E"}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                  />
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700"
                    >
                      <FaCamera className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div>
                  {isEditable && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={field.accept}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <p className="text-sm text-gray-600">
                        Click the camera icon to change profile photo
                      </p>
                      <p className="text-xs text-gray-500">Max size: 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        }
        break;

      default:
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={value}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              min={field.min}
              readOnly={field.readonly || isViewOnly}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${field.readonly || isViewOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
            {field.maxLength && (
              <p className="text-xs text-gray-500">
                {value.length || 0}/{field.maxLength} characters
              </p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        );
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error?.data?.message || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  const studentFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true, maxLength: 50 },
    { name: 'email', label: 'Email', type: 'email', readonly: true },
    { name: 'phone', label: 'Phone Number', type: 'text', required: true, maxLength: 10 },
    { name: 'profileImage', label: 'Profile Photo', type: 'file', accept: 'image/*' },
    { name: 'gender', label: 'Gender', type: 'select', options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' }
    ]},
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { name: 'bio', label: 'Bio / About', type: 'textarea', maxLength: 500, rows: 3 },

    { name: 'address', label: 'Address', type: 'textarea', maxLength: 200, rows: 2 },
    { name: 'city', label: 'City', type: 'text', maxLength: 50 },
    { name: 'state', label: 'State', type: 'text', maxLength: 50 },
    { name: 'country', label: 'Country', type: 'text', maxLength: 50 },
    { name: 'pincode', label: 'Pincode', type: 'text', maxLength: 10 },

    { name: 'parentName', label: 'Parent Name', type: 'text', maxLength: 50 },
    { name: 'parentPhone', label: 'Parent Phone Number', type: 'text', maxLength: 10 },
    { name: 'schoolCollege', label: 'School / College Name', type: 'text', maxLength: 100 },
    { name: 'classStandard', label: 'Class / Standard', type: 'text', maxLength: 20 },
    { name: 'stream', label: 'Stream', type: 'text', maxLength: 50 },

    { name: 'enrolledSubjectsCount', label: 'Assigned Subjects', type: 'text', readonly: true },
    { name: 'progressPercentage', label: 'Progress Percentage', type: 'text', readonly: true },
    { name: 'joinedDate', label: 'Joined Date', type: 'text', readonly: true },
    { name: 'lastLogin', label: 'Last Login', type: 'text', readonly: true }
  ];

  return (
    <RoleProtectedRoute allowedRoles={isEditable ? [ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN] : [ROLES.STUDENT]}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isEditable && (
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-blue-700 rounded-full"
                  >
                    <FaArrowLeft />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold">
                    {isEditable ? 'Edit Student Profile' : 'Student Profile'}
                  </h1>
                  <p className="text-blue-100">
                    {isEditable ? 'Edit student information' : 'View your personal and academic information'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={profileImagePreview || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96' fill='none'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23E5E7EB'/%3E%3Cpath d='M48 50c6.627 0 12-5.373 12-12s-5.373-12-12-12-12 5.373-12 12 5.373 12 12 12zm0 4c-8.284 0-15 6.716-15 15v3h30v-3c0-8.284-6.716-15-15-15z' fill='%239CA3AF'/%3E%3C/svg%3E"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{profile?.name}</h2>
                  <p className="text-gray-600">{profile?.email}</p>
                  <p className="text-sm text-gray-500">Student</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6">
              {isEditable && Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="text-sm text-red-700">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>
                  {studentFields.slice(0, 7).map(renderField)}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Contact Information
                  </h3>
                  {studentFields.slice(7, 12).map(renderField)}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Academic Information
                  </h3>
                  {studentFields.slice(12, 17).map(renderField)}
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Account Information
                  </h3>
                  {studentFields.slice(17).map(renderField)}
                </div>
              </div>

              {isEditable && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaSave />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default StudentProfile;
