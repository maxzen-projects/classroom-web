import React, { useState, useRef, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/profileApi';
import { UPLOADS_BASE_URL } from '../redux/baseApi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import { validateAdminProfile } from '../utils/validations';

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const { data: profile, isLoading, error } = useGetProfileQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Initialize profile image preview when profile loads
  useEffect(() => {
    if (profile?.profileImage) {
      setProfileImagePreview(`${UPLOADS_BASE_URL}${profile.profileImage}`);
    }
  }, [profile]);

  const handleUpdateProfile = async (submitData) => {
    try {
      // Debug: Log FormData contents
      console.log('Submitting FormData:');
      for (let [key, value] of submitData.entries()) {
        console.log(`  ${key}: ${value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value}`);
      }
      
      const result = await updateProfile(submitData).unwrap();
      // Update user context with new profile data
      if (result.user) {
        const updatedUser = { ...user, ...result.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Update profile image preview
        if (result.user.profileImage) {
          setProfileImagePreview(`${UPLOADS_BASE_URL}${result.user.profileImage}`);
        }
      }
      toast.success('Profile updated successfully!');
      // Reset file input after successful upload
      setProfileImage(null);
    } catch (error) {
      console.error('Profile update error - Status:', error?.status);
      console.error('Profile update error - Data:', error?.data);
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    // Reset form to initial state
    if (profile) {
      setFormData(initialData);
      setProfileImage(null);
      if (profile.profileImage) {
        setProfileImagePreview(`${UPLOADS_BASE_URL}${profile.profileImage}`);
      } else {
        setProfileImagePreview(null);
      }
      setErrors({});
    }
    window.history.back();
  };

  const adminFields = [
    // Personal Information
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

    // Contact Information
    { name: 'address', label: 'Address', type: 'textarea', maxLength: 200, rows: 2 },
    { name: 'city', label: 'City', type: 'text', maxLength: 50 },
    { name: 'state', label: 'State', type: 'text', maxLength: 50 },
    { name: 'country', label: 'Country', type: 'text', maxLength: 50 },
    { name: 'pincode', label: 'Pincode', type: 'text', maxLength: 10 },

    // Administrative Information
    { name: 'department', label: 'Department', type: 'text', maxLength: 50 },

    // Account Information (readonly)
    { name: 'permissions', label: 'Permissions', type: 'text', readonly: true },
    { name: 'joinedDate', label: 'Joined Date', type: 'text', readonly: true },
    { name: 'lastLogin', label: 'Last Login', type: 'text', readonly: true },
    { name: 'accountStatus', label: 'Account Status', type: 'text', readonly: true },
    { name: 'activityLogsCount', label: 'Activity Logs Count', type: 'text', readonly: true }
  ];

  const initialData = React.useMemo(() => ({
    ...profile,
    permissions: profile?.permissions?.join(', ') || 'All Admin Permissions',
    joinedDate: profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : '',
    lastLogin: profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : '',
    accountStatus: profile?.accountStatus || 'Active',
    activityLogsCount: profile?.activityLogsCount || 0
  }), [profile]);

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setFormData(initialData);
      // Initialize profile image preview
      if (profile.profileImage) {
        setProfileImagePreview(`${UPLOADS_BASE_URL}${profile.profileImage}`);
      }
    }
  }, [profile, initialData]);

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

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleFileChange = (fieldName, file) => {
    if (file) {
      // Validate file size (5MB max for images)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (fieldName === 'profileImage') {
        setProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate form using comprehensive validation
    const newErrors = validateAdminProfile(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix all errors before submitting');
      return;
    }

    // Prepare FormData for submission
    const submitData = new FormData();
    const updatableFields = adminFields.filter(field => !field.readonly).map(field => field.name);
    
    // Add text fields - only send non-empty values
    Object.keys(formData).forEach(key => {
      if (updatableFields.includes(key)) {
        const value = formData[key];
        
        // Skip if null or undefined
        if (value === null || value === undefined) {
          return;
        }
        
        // Skip empty strings
        if (typeof value === 'string' && value.trim() === '') {
          return;
        }
        
        // Handle different value types
        if (value instanceof File) {
          submitData.append(key, value);
        } else if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          submitData.append(key, value);
        }
      }
    });

    // Add profile image file if selected
    if (profileImage) {
      submitData.append('profileImage', profileImage);
    }

    handleUpdateProfile(submitData);
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div>
            <textarea
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.readonly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                field.readonly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              } ${error ? 'border-red-500' : 'border-gray-300'}`}
              rows={field.rows || 3}
              maxLength={field.maxLength}
            />
            {field.maxLength && (
              <p className="text-xs text-gray-500 mt-1">
                {value.length}/{field.maxLength} characters
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={field.readonly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              field.readonly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            } ${error ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.name}
            name={field.name}
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            disabled={field.readonly}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              field.readonly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            } ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
        );

      case 'file':
        if (field.name === 'profileImage') {
          return (
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                id={field.name}
                name={field.name}
                accept={field.accept}
                onChange={(e) => handleFileChange(field.name, e.target.files[0])}
                disabled={field.readonly}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={field.readonly}
                className={`flex items-center px-4 py-2 border rounded-md ${
                  field.readonly 
                    ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FaCamera className="mr-2" />
                {profileImage?.name || 'Choose Profile Photo'}
              </button>
              {profileImage && (
                <span className="text-sm text-gray-600">
                  {profileImage.name}
                </span>
              )}
            </div>
          );
        }
        break;

      case 'array':
        return (
          <div className="space-y-2">
            {(value || []).map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newArray = [...(value || [])];
                    newArray[index] = e.target.value;
                    handleInputChange(field.name, newArray);
                  }}
                  placeholder={`${field.placeholder} ${index + 1}`}
                  disabled={field.readonly}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    field.readonly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  } ${error ? 'border-red-500' : 'border-gray-300'}`}
                />
                {!field.readonly && (
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = (value || []).filter((_, i) => i !== index);
                      handleInputChange(field.name, newArray);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
            {!field.readonly && (
              <button
                type="button"
                onClick={() => {
                  const newArray = [...(value || []), ''];
                  handleInputChange(field.name, newArray);
                }}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                + Add {field.label.toLowerCase()}
              </button>
            )}
          </div>
        );

      default:
        return (
          <div>
            <input
              type={field.type || 'text'}
              id={field.name}
              name={field.name}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.readonly}
              maxLength={field.maxLength}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                field.readonly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              } ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {field.maxLength && (
              <p className="text-xs text-gray-500 mt-1">
                {value.length || 0}/{field.maxLength} characters
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-purple-600 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Admin Profile</h1>
              <p className="text-purple-100">Manage your personal and administrative information</p>
            </div>

            {/* Profile Image */}
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
                  <p className="text-sm text-gray-500">Administrator</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 py-6">
              {/* Validation Error Summary */}
              {Object.keys(errors).length > 0 && (
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

              <form onSubmit={handleFormSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      {adminFields.slice(0, 7).map(field => (
                        <div key={field.name} className="space-y-2">
                          <label 
                            htmlFor={field.name} 
                            className={`block text-sm font-medium ${
                              field.readonly ? 'text-gray-500' : 'text-gray-700'
                            }`}
                          >
                            {field.label}
                            {field.required && !field.readonly && <span className="text-red-500">*</span>}
                          </label>
                          {renderField(field)}
                          {errors[field.name] && (
                            <p className="text-red-500 text-sm">{errors[field.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      {adminFields.slice(7, 12).map(field => (
                        <div key={field.name} className="space-y-2">
                          <label 
                            htmlFor={field.name} 
                            className={`block text-sm font-medium ${
                              field.readonly ? 'text-gray-500' : 'text-gray-700'
                            }`}
                          >
                            {field.label}
                            {field.required && !field.readonly && <span className="text-red-500">*</span>}
                          </label>
                          {renderField(field)}
                          {errors[field.name] && (
                            <p className="text-red-500 text-sm">{errors[field.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Administrative Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Administrative Information
                    </h3>
                    <div className="space-y-4">
                      {adminFields.slice(12, 13).map(field => (
                        <div key={field.name} className="space-y-2">
                          <label 
                            htmlFor={field.name} 
                            className={`block text-sm font-medium ${
                              field.readonly ? 'text-gray-500' : 'text-gray-700'
                            }`}
                          >
                            {field.label}
                            {field.required && !field.readonly && <span className="text-red-500">*</span>}
                          </label>
                          {renderField(field)}
                          {errors[field.name] && (
                            <p className="text-red-500 text-sm">{errors[field.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Account Information
                    </h3>
                    <div className="space-y-4">
                      {adminFields.slice(13).map(field => (
                        <div key={field.name} className="space-y-2">
                          <label 
                            htmlFor={field.name} 
                            className={`block text-sm font-medium ${
                              field.readonly ? 'text-gray-500' : 'text-gray-700'
                            }`}
                          >
                            {field.label}
                            {field.required && !field.readonly && <span className="text-red-500">*</span>}
                          </label>
                          {renderField(field)}
                          {errors[field.name] && (
                            <p className="text-red-500 text-sm">{errors[field.name]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={updating}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {updating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <FaSave className="mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default AdminProfile;