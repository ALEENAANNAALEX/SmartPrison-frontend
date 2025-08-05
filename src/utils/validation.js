// Real-time validation utility functions

export const validateName = (name) => {
  if (!name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s-']+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  if (/\d/.test(name)) return 'Name cannot contain numbers';
  return '';
};

export const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePhoneNumber = (phone) => {
  if (!phone.trim()) return '';
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length !== 10) return 'Phone number must be exactly 10 digits';
  if (!/^[6-9]/.test(digitsOnly)) return 'Phone number must start with 6, 7, 8, or 9';
  return '';
};

export const validateRequiredPhoneNumber = (phone) => {
  if (!phone.trim()) return 'Phone number is required';
  return validatePhoneNumber(phone);
};

export const validateDateOfBirth = (dateStr) => {
  if (!dateStr) return '';
  const birthDate = new Date(dateStr);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) return 'Please enter a valid date';
  
  // Check if date is not in the future
  if (birthDate > today) return 'Date of birth cannot be in the future';
  
  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // Check minimum age requirement
  if (age < 18) return 'You must be at least 18 years old';
  if (age > 120) return 'Please enter a valid date of birth';
  
  return '';
};

export const validateRequiredDateOfBirth = (dateStr) => {
  if (!dateStr) return 'Date of birth is required';
  return validateDateOfBirth(dateStr);
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const validateAddress = (address) => {
  if (!address.trim()) return 'Address is required';
  if (address.trim().length < 10) return 'Address must be at least 10 characters';
  return '';
};

export const validateOptionalAddress = (address) => {
  if (!address.trim()) return '';
  if (address.trim().length < 10) return 'Address must be at least 10 characters';
  return '';
};

export const validateInmateId = (inmateId) => {
  if (!inmateId.trim()) return 'Inmate ID is required';
  if (!/^[A-Z0-9]{6,12}$/.test(inmateId)) return 'Inmate ID must be 6-12 characters (letters and numbers only)';
  return '';
};

export const validateVisitDate = (dateStr) => {
  if (!dateStr) return 'Visit date is required';
  const visitDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  if (isNaN(visitDate.getTime())) return 'Please enter a valid date';
  if (visitDate < today) return 'Visit date cannot be in the past';
  
  // Check if date is too far in the future (e.g., 3 months)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  if (visitDate > maxDate) return 'Visit date cannot be more than 3 months in advance';
  
  return '';
};

export const validateVisitTime = (time) => {
  if (!time) return 'Visit time is required';
  const [hours, minutes] = time.split(':').map(Number);
  
  // Check if time is within visiting hours (e.g., 9 AM to 5 PM)
  if (hours < 9 || hours > 17) return 'Visit time must be between 9:00 AM and 5:00 PM';
  
  return '';
};

export const validateRelationship = (relationship) => {
  if (!relationship.trim()) return 'Relationship is required';
  const validRelationships = ['father', 'mother', 'spouse', 'child', 'sibling', 'friend', 'lawyer', 'other'];
  if (!validRelationships.includes(relationship.toLowerCase())) {
    return 'Please select a valid relationship';
  }
  return '';
};

export const validatePurpose = (purpose) => {
  if (!purpose.trim()) return 'Purpose of visit is required';
  if (purpose.trim().length < 5) return 'Purpose must be at least 5 characters';
  return '';
};

// Utility function to format phone number as user types
export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  if (digitsOnly.length <= 10) {
    return digitsOnly;
  }
  
  return digitsOnly.slice(0, 10);
};

// Utility function to get max date for 18+ validation
export const getMaxDateFor18Plus = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
};

// Utility function to get min date for visit scheduling (today)
export const getMinDateForVisit = () => {
  return new Date().toISOString().split('T')[0];
};

// Utility function to get max date for visit scheduling (3 months from now)
export const getMaxDateForVisit = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().split('T')[0];
};

// Utility function to validate all form fields
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const validator = validationRules[field];
    const value = getNestedValue(formData, field);
    const error = validator(value);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

// Helper function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Common validation rule sets for different forms
export const profileValidationRules = {
  name: validateName,
  email: validateEmail,
  phoneNumber: validatePhoneNumber,
  dateOfBirth: validateDateOfBirth,
  'emergencyContact.name': validateName,
  'emergencyContact.phone': validatePhoneNumber,
  'emergencyContact.email': validateEmail
};

export const visitScheduleValidationRules = {
  inmateName: validateName,
  inmateId: validateInmateId,
  visitDate: validateVisitDate,
  visitTime: validateVisitTime,
  relationship: validateRelationship,
  purpose: validatePurpose
};

export const registrationValidationRules = {
  name: validateName,
  email: validateEmail,
  password: validatePassword,
  phoneNumber: validateRequiredPhoneNumber,
  dateOfBirth: validateRequiredDateOfBirth,
  address: validateAddress
};
