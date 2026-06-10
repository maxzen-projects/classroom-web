/**
 * Validation utility functions for profile forms
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (10 digits)
const PHONE_REGEX = /^\d{10}$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/.+/;

// Pincode validation regex (5-10 digits)
const PINCODE_REGEX = /^\d{5,10}$/;

/**
 * Validates email address
 * @param {string} email - Email to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) return '';
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

/**
 * Validates phone number (10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return '';
  if (!PHONE_REGEX.test(phone)) {
    return 'Phone number must be exactly 10 digits';
  }
  return '';
};

/**
 * Validates required text field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string} - Error message or empty string if valid
 */
export const validateRequired = (value, fieldName) => {
  if (!value || !value.toString().trim()) {
    return `${fieldName} is required`;
  }
  return '';
};

/**
 * Validates text length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Field name for error message
 * @returns {string} - Error message or empty string if valid
 */
export const validateMaxLength = (value, maxLength, fieldName) => {
  if (!value) return '';
  if (value.toString().length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return '';
};

/**
 * Validates minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum required length
 * @param {string} fieldName - Field name for error message
 * @returns {string} - Error message or empty string if valid
 */
export const validateMinLength = (value, minLength, fieldName) => {
  if (!value || value.toString().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return '';
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validateURL = (url) => {
  if (!url || !url.trim()) return '';
  if (!URL_REGEX.test(url)) {
    return 'Please enter a valid URL starting with http:// or https://';
  }
  return '';
};

/**
 * Validates pincode
 * @param {string} pincode - Pincode to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validatePincode = (pincode) => {
  if (!pincode || !pincode.trim()) return '';
  if (!PINCODE_REGEX.test(pincode)) {
    return 'Pincode must be 5-10 digits';
  }
  return '';
};

/**
 * Validates date of birth (not future date)
 * @param {string|Date} dateOfBirth - Date to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const date = new Date(dateOfBirth);
  const today = new Date();
  
  if (date > today) {
    return 'Date of birth cannot be in the future';
  }
  
  // Check if age is at least 5 years
  const age = today.getFullYear() - date.getFullYear();
  const monthDifference = today.getMonth() - date.getMonth();
  
  if (age < 5 || (age === 5 && monthDifference < 0)) {
    return 'You must be at least 5 years old to register';
  }
  
  return '';
};

/**
 * Validates experience (number between 0 and 50)
 * @param {number|string} experience - Experience to validate
 * @returns {string} - Error message or empty string if valid
 */
export const validateExperience = (experience) => {
  if (experience === '' || experience === null || experience === undefined) return '';
  
  const exp = parseFloat(experience);
  
  if (isNaN(exp)) {
    return 'Experience must be a valid number';
  }
  
  if (exp < 0 || exp > 50) {
    return 'Experience must be between 0 and 50 years';
  }
  
  return '';
};

/**
 * Validates array field (skills, certifications, etc.)
 * @param {array} array - Array to validate
 * @param {string} fieldName - Field name for error message
 * @param {number} minItems - Minimum number of items required
 * @returns {string} - Error message or empty string if valid
 */
export const validateArray = (array, fieldName, minItems = 0) => {
  if (!array || !Array.isArray(array)) return '';
  
  const validItems = array.filter(item => item && item.toString().trim() !== '');
  
  if (validItems.length < minItems) {
    return `Please add at least ${minItems} ${fieldName.toLowerCase()}`;
  }
  
  return '';
};

/**
 * Comprehensive Admin Profile validation
 * @param {object} formData - Form data to validate
 * @returns {object} - Errors object with field: error pairs
 */
export const validateAdminProfile = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = 'Full name is required';
  } else if (formData.name.length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  } else if (formData.name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  // Phone validation
  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_REGEX.test(formData.phone)) {
    errors.phone = 'Phone number must be exactly 10 digits';
  }

  // Gender validation
  if (formData.gender && !['male', 'female', 'other'].includes(formData.gender)) {
    errors.gender = 'Please select a valid gender';
  }

  // Date of birth validation
  if (formData.dateOfBirth) {
    errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth);
  }

  // Bio validation
  if (formData.bio && formData.bio.length > 500) {
    errors.bio = 'Bio must not exceed 500 characters';
  }

  // Address validation
  if (formData.address && formData.address.length > 200) {
    errors.address = 'Address must not exceed 200 characters';
  }

  // City validation
  if (formData.city && formData.city.length > 50) {
    errors.city = 'City must not exceed 50 characters';
  }

  // State validation
  if (formData.state && formData.state.length > 50) {
    errors.state = 'State must not exceed 50 characters';
  }

  // Country validation
  if (formData.country && formData.country.length > 50) {
    errors.country = 'Country must not exceed 50 characters';
  }

  // Pincode validation
  if (formData.pincode && !validatePincode(formData.pincode)) {
    errors.pincode = validatePincode(formData.pincode);
  }

  // Department validation
  if (formData.department && formData.department.length > 50) {
    errors.department = 'Department must not exceed 50 characters';
  }

  return errors;
};

/**
 * Comprehensive Student Profile validation
 * @param {object} formData - Form data to validate
 * @returns {object} - Errors object with field: error pairs
 */
export const validateStudentProfile = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = 'Full name is required';
  } else if (formData.name.length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  } else if (formData.name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  // Phone validation
  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_REGEX.test(formData.phone)) {
    errors.phone = 'Phone number must be exactly 10 digits';
  }

  // Gender validation
  if (formData.gender && !['male', 'female', 'other'].includes(formData.gender)) {
    errors.gender = 'Please select a valid gender';
  }

  // Date of birth validation
  if (formData.dateOfBirth) {
    errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth);
  }

  // Bio validation
  if (formData.bio && formData.bio.length > 500) {
    errors.bio = 'Bio must not exceed 500 characters';
  }

  // Address validation
  if (formData.address && formData.address.length > 200) {
    errors.address = 'Address must not exceed 200 characters';
  }

  // City validation
  if (formData.city && formData.city.length > 50) {
    errors.city = 'City must not exceed 50 characters';
  }

  // State validation
  if (formData.state && formData.state.length > 50) {
    errors.state = 'State must not exceed 50 characters';
  }

  // Country validation
  if (formData.country && formData.country.length > 50) {
    errors.country = 'Country must not exceed 50 characters';
  }

  // Pincode validation
  if (formData.pincode) {
    errors.pincode = validatePincode(formData.pincode);
  }

  // Parent name validation
  if (formData.parentName && formData.parentName.length > 50) {
    errors.parentName = 'Parent name must not exceed 50 characters';
  }

  // Parent phone validation
  if (formData.parentPhone) {
    errors.parentPhone = validatePhone(formData.parentPhone);
  }

  // School/College validation
  if (formData.schoolCollege && formData.schoolCollege.length > 100) {
    errors.schoolCollege = 'School/College name must not exceed 100 characters';
  }

  // Class/Standard validation
  if (formData.classStandard && formData.classStandard.length > 20) {
    errors.classStandard = 'Class/Standard must not exceed 20 characters';
  }

  // Stream validation
  if (formData.stream && formData.stream.length > 50) {
    errors.stream = 'Stream must not exceed 50 characters';
  }

  return errors;
};

/**
 * Comprehensive Teacher Profile validation
 * @param {object} formData - Form data to validate
 * @param {array} skills - Skills array
 * @param {array} subjectsTeaching - Subjects teaching array
 * @returns {object} - Errors object with field: error pairs
 */
export const validateTeacherProfile = (formData, skills = [], subjectsTeaching = []) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = 'Full name is required';
  } else if (formData.name.length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  } else if (formData.name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  // Phone validation
  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!PHONE_REGEX.test(formData.phone)) {
    errors.phone = 'Phone number must be exactly 10 digits';
  }

  // Gender validation
  if (formData.gender && !['male', 'female', 'other'].includes(formData.gender)) {
    errors.gender = 'Please select a valid gender';
  }

  // Date of birth validation
  if (formData.dateOfBirth) {
    errors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth);
  }

  // Bio validation
  if (formData.bio && formData.bio.length > 500) {
    errors.bio = 'Bio must not exceed 500 characters';
  }

  // Address validation
  if (formData.address && formData.address.length > 200) {
    errors.address = 'Address must not exceed 200 characters';
  }

  // City validation
  if (formData.city && formData.city.length > 50) {
    errors.city = 'City must not exceed 50 characters';
  }

  // State validation
  if (formData.state && formData.state.length > 50) {
    errors.state = 'State must not exceed 50 characters';
  }

  // Country validation
  if (formData.country && formData.country.length > 50) {
    errors.country = 'Country must not exceed 50 characters';
  }

  // Pincode validation
  if (formData.pincode) {
    errors.pincode = validatePincode(formData.pincode);
  }

  // Qualification validation
  if (formData.qualification && formData.qualification.length > 100) {
    errors.qualification = 'Qualification must not exceed 100 characters';
  }

  // Specialization validation
  if (formData.specialization && formData.specialization.length > 100) {
    errors.specialization = 'Specialization must not exceed 100 characters';
  }

  // Experience validation
  if (formData.experience !== undefined && formData.experience !== null && formData.experience !== '') {
    errors.experience = validateExperience(formData.experience);
  }

  // Skills validation (at least 1 skill required)
  if (!skills || skills.length === 0 || !skills.some(s => s && s.trim())) {
    errors.skills = 'Please add at least one skill';
  }

  // Subjects teaching validation (at least 1 subject required)
  if (!subjectsTeaching || subjectsTeaching.length === 0 || !subjectsTeaching.some(s => s && s.trim())) {
    errors.subjectsTeaching = 'Please add at least one subject you teach';
  }

  // LinkedIn validation
  if (formData.linkedin) {
    errors.linkedin = validateURL(formData.linkedin);
  }

  return errors;
};
