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
  if (/^[1-5]/.test(digitsOnly)) return 'Phone number cannot start with 1, 2, 3, 4, or 5';
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
  if (!/(?=.*[a-zA-Z])/.test(password)) return 'Password must contain at least one letter';
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

// Utility function to filter phone input (prevent alphabets and unwanted special characters)
export const filterPhoneInput = (value) => {
  // Allow only digits, spaces, hyphens, parentheses, and plus sign
  return value.replace(/[^0-9\s\-\(\)\+]/g, '');
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

// User role validation
export const validateRole = (role) => {
  const validRoles = ['admin', 'warden', 'visitor'];
  if (!role) return 'Role is required';
  if (!validRoles.includes(role)) return 'Please select a valid role';
  return '';
};

// User status validation
export const validateUserStatus = (isActive) => {
  if (typeof isActive !== 'boolean') return 'User status must be specified';
  return '';
};

// Password validation for editing (optional)
export const validateOptionalPassword = (password) => {
  if (!password) return ''; // Password is optional when editing
  return validatePassword(password);
};

// Email uniqueness validation (to be used with API call)
export const validateEmailUniqueness = async (email, userId = null) => {
  if (!email) return 'Email is required';
  
  const basicValidation = validateEmail(email);
  if (basicValidation) return basicValidation;
  
  try {
    const response = await fetch(`http://localhost:5000/api/admin/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({ email, userId })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (!data.available) {
        return 'This email is already registered';
      }
    }
  } catch (error) {
    console.error('Error checking email uniqueness:', error);
    // Don't block form submission if API call fails
  }
  
  return '';
};

// Phone number validation for users (optional)
export const validateUserPhone = (phone) => {
  if (!phone || !phone.trim()) return ''; // Phone is optional for users
  
  // Since we're filtering input in real-time, we don't need to show these errors
  // The filtering prevents invalid characters from being entered
  
  return validatePhoneNumber(phone);
};

// Address validation for users (optional)
export const validateUserAddress = (address) => {
  if (!address || !address.trim()) return ''; // Address is optional for users
  if (address.trim().length < 5) return 'Address must be at least 5 characters if provided';
  if (address.trim().length > 200) return 'Address must be less than 200 characters';
  return '';
};

// Gender validation (optional)
export const validateGender = (gender) => {
  if (!gender || !gender.trim()) return ''; // Gender is optional
  const validGenders = ['male', 'female', 'other'];
  if (!validGenders.includes(gender.toLowerCase())) return 'Please select a valid gender';
  return '';
};

// Nationality validation (optional)
export const validateNationality = (nationality) => {
  if (!nationality || !nationality.trim()) return ''; // Nationality is optional
  if (nationality.trim().length < 2) return 'Nationality must be at least 2 characters if provided';
  if (nationality.trim().length > 50) return 'Nationality must be less than 50 characters';
  if (!/^[a-zA-Z\s-']+$/.test(nationality.trim())) return 'Nationality can only contain letters, spaces, hyphens, and apostrophes';
  return '';
};

export const registrationValidationRules = {
  name: validateName,
  email: validateEmail,
  password: validatePassword,
  phoneNumber: validateRequiredPhoneNumber,
  dateOfBirth: validateRequiredDateOfBirth,
  address: validateAddress
};

// User management validation rules (for editing - email cannot be changed)
export const userValidationRules = {
  name: validateName,
  email: () => '', // Email cannot be changed during editing
  password: validateOptionalPassword,
  role: validateRole,
  phone: validateUserPhone,
  address: validateUserAddress,
  gender: validateGender,
  nationality: validateNationality,
  isActive: validateUserStatus
};

// User creation validation rules (password required)
export const userCreationValidationRules = {
  name: validateName,
  email: validateEmail,
  password: validatePassword,
  role: validateRole,
  phone: validateUserPhone,
  address: validateUserAddress,
  gender: validateGender,
  nationality: validateNationality,
  isActive: validateUserStatus
};

// Warden-specific validation functions
export const validateExperience = (experience) => {
  if (!experience || experience === '') return ''; // Optional field
  const exp = parseInt(experience);
  if (isNaN(exp)) return 'Experience must be a valid number';
  if (exp < 0) return 'Experience cannot be negative';
  if (exp > 50) return 'Experience cannot exceed 50 years';
  return '';
};

export const validateSpecialization = (specialization) => {
  if (!specialization || !specialization.trim()) return ''; // Optional field
  if (specialization.trim().length < 3) return 'Specialization must be at least 3 characters if provided';
  if (specialization.trim().length > 100) return 'Specialization must be less than 100 characters';
  if (!/^[a-zA-Z\s,.-]+$/.test(specialization.trim())) return 'Specialization can only contain letters, spaces, commas, periods, and hyphens';
  return '';
};

export const validateShift = (shift) => {
  if (!shift) return 'Shift is required';
  const validShifts = ['day', 'night', 'rotating'];
  if (!validShifts.includes(shift)) return 'Please select a valid shift';
  return '';
};

export const validateAssignedBlocks = (assignedBlocks) => {
  if (!assignedBlocks || assignedBlocks.length === 0) return ''; // Optional field
  if (assignedBlocks.length > 10) return 'Cannot assign more than 10 blocks to a single warden';
  return '';
};

// Warden validation rules
export const wardenValidationRules = {
  name: validateName,
  email: validateEmail,
  phone: validateUserPhone,
  experience: validateExperience,
  specialization: validateSpecialization,
  shift: validateShift,
  assignedBlocks: validateAssignedBlocks
};
