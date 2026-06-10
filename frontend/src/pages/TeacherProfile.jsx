import React, { useState, useRef, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../redux/profileApi';
import { UPLOADS_BASE_URL } from '../redux/baseApi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { ROLES } from '../routes';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import { validateTeacherProfile } from '../utils/validations';

const TeacherProfile = () => {
  const { user, setUser } = useAuth();
  const { data: profile, isLoading, error } = useGetProfileQuery();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

  // Form state management
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [resume, setResume] = useState(null);
  const [skills, setSkills] = useState([]);
  const [subjectsTeaching, setSubjectsTeaching] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      const initialData = {
        ...profile,
        totalSubjects: profile?.assignedSubjects?.length || 0,
        joinedDate: profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : '',
        lastLogin: profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : ''
      };
      setFormData(initialData);
      setSkills(profile?.skills || []);
      setSubjectsTeaching(profile?.subjectsTeaching || []);
      setCertifications(profile?.certifications || []);
      setProfileImagePreview(profile?.profileImage ? `${UPLOADS_BASE_URL}${profile.profileImage}` : null);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Resume file size must be less than 10MB');
        return;
      }
      setResume(file);
    }
  };

  const handleArrayChange = (field, value) => {
    if (field === 'skills') setSkills(value);
    else if (field === 'subjectsTeaching') setSubjectsTeaching(value);
    else if (field === 'certifications') setCertifications(value);
  };

  const validateForm = () => {
    const newErrors = validateTeacherProfile(formData, skills, subjectsTeaching);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      const submitData = new FormData();

      // Add basic form data - only updatable fields
      const updatableFields = teacherFields.filter(field => !field.readonly).map(field => field.name);
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

      // Add arrays
      skills.forEach(skill => submitData.append('skills', skill));
      subjectsTeaching.forEach(subject => submitData.append('subjectsTeaching', subject));
      certifications.forEach(cert => submitData.append('certifications', cert));

      // Add files
      if (profileImage) {
        submitData.append('profileImage', profileImage);
      }
      if (resume) {
        submitData.append('resume', resume);
      }

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
      // Reset file inputs after successful upload
      setProfileImage(null);
      setResume(null);
    } catch (error) {
      console.error('Profile update error - Status:', error?.status);
      console.error('Profile update error - Data:', error?.data);
      toast.error(error?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    // Reset form to initial state
    if (profile) {
      const initialData = {
        ...profile,
        totalSubjects: profile?.assignedSubjects?.length || 0,
        joinedDate: profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : '',
        lastLogin: profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : ''
      };
      setFormData(initialData);
      setSkills(profile?.skills || []);
      setSubjectsTeaching(profile?.subjectsTeaching || []);
      setCertifications(profile?.certifications || []);
      setProfileImage(null);
      setResume(null);
      setProfileImagePreview(profile?.profileImage ? `${UPLOADS_BASE_URL}${profile.profileImage}` : null);
      setErrors({});
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

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
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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

      case 'array':
        const arrayValue = field.name === 'skills' ? skills :
                          field.name === 'subjectsTeaching' ? subjectsTeaching :
                          certifications;
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <div className="space-y-2">
              {arrayValue.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newArray = [...arrayValue];
                      newArray[index] = e.target.value;
                      handleArrayChange(field.name, newArray);
                    }}
                    placeholder={field.placeholder}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newArray = arrayValue.filter((_, i) => i !== index);
                      handleArrayChange(field.name, newArray);
                    }}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  handleArrayChange(field.name, [...arrayValue, '']);
                }}
                className="px-4 py-2 text-sm text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50"
              >
                + Add {field.placeholder}
              </button>
            </div>
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700"
                  >
                    <FaCamera className="w-3 h-3" />
                  </button>
                </div>
                <div>
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
                </div>
              </div>
            </div>
          );
        } else if (field.name === 'resume') {
          return (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <div className="space-y-2">
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept={field.accept}
                  onChange={handleResumeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500">Max size: 10MB. Accepted formats: PDF, DOC, DOCX</p>
                {resume && (
                  <p className="text-sm text-green-600">
                    Selected: {resume.name}
                  </p>
                )}
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
              readOnly={field.readonly}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              } ${field.readonly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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

  const teacherFields = [
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

    // Professional Information
    { name: 'qualification', label: 'Qualification', type: 'text', maxLength: 100 },
    { name: 'specialization', label: 'Specialization', type: 'text', maxLength: 100 },
    { name: 'experience', label: 'Experience (years)', type: 'number', min: 0 },
    { name: 'skills', label: 'Skills', type: 'array', placeholder: 'Skill' },
    { name: 'subjectsTeaching', label: 'Subjects Teaching', type: 'array', placeholder: 'Subject' },
    { name: 'certifications', label: 'Certifications', type: 'array', placeholder: 'Certification' },
    { name: 'linkedin', label: 'LinkedIn Profile', type: 'url', placeholder: 'https://linkedin.com/in/yourprofile' },
    { name: 'resume', label: 'Resume', type: 'file', accept: '.pdf,.doc,.docx' },

    // Account Information (readonly)
    { name: 'totalSubjects', label: 'Total Subjects Assigned', type: 'text', readonly: true },
    { name: 'totalStudents', label: 'Total Students', type: 'text', readonly: true },
    { name: 'joinedDate', label: 'Joined Date', type: 'text', readonly: true },
    { name: 'lastLogin', label: 'Last Login', type: 'text', readonly: true }
  ];

  return (
    <RoleProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Teacher Profile</h1>
              <p className="text-green-100">Manage your personal and professional information</p>
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
                  <p className="text-sm text-gray-500">Teacher</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>
                  {teacherFields.slice(0, 7).map(renderField)}
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Contact Information
                  </h3>
                  {teacherFields.slice(7, 12).map(renderField)}
                </div>

                {/* Professional Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Professional Information
                  </h3>
                  {teacherFields.slice(12, 20).map(renderField)}
                </div>

                {/* Account Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Account Information
                  </h3>
                  {teacherFields.slice(20).map(renderField)}
                </div>
              </div>

              {/* Form Actions */}
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
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
            </form>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default TeacherProfile;
