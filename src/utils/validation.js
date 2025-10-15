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

  // Min = tomorrow
  const min = new Date(today);
  min.setDate(min.getDate() + 1);
  if (visitDate < min) return 'Visit date must be from tomorrow onwards';

  // Max = +1 month from tomorrow (inclusive)
  const max = new Date(min);
  max.setMonth(max.getMonth() + 1);
  if (visitDate > max) return 'Visit date cannot be more than 1 month ahead';

  return '';
};

export const validateVisitTime = (time) => {
  if (!time) return 'Visit time is required';
  
  // Valid time slots (hourly from 9 AM to 5 PM)
  const validSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  if (validSlots.includes(time)) {
    return '';
  }
  
  return 'Invalid visit time slot';
};

// List of public holidays (format: YYYY-MM-DD)
const PUBLIC_HOLIDAYS = [
  '2025-01-01', // New Year's Day
  '2025-01-26', // Republic Day
  '2025-03-08', // Holi
  '2025-03-29', // Good Friday
  '2025-04-14', // Ambedkar Jayanti
  '2025-04-17', // Ram Navami
  '2025-05-01', // Labour Day
  '2025-08-15', // Independence Day
  '2025-08-26', // Janmashtami
  '2025-09-07', // Ganesh Chaturthi
  '2025-10-02', // Gandhi Jayanti
  '2025-10-12', // Dussehra
  '2025-10-31', // Diwali
  '2025-11-01', // Diwali (Day 2)
  '2025-12-25', // Christmas Day
];

export const validateVisitDateForVisitorArea = (date) => {
  if (!date) return 'Visit date is required';
  
  const visitDate = new Date(date);
  const dayOfWeek = visitDate.getDay(); // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  
  // Only allow Tuesday (2), Thursday (4), Saturday (6)
  if (![2, 4, 6].includes(dayOfWeek)) {
    return 'Visits to Visitor Area are only allowed on Tuesday, Thursday, and Saturday';
  }
  
  // Check if it's a public holiday
  const dateStr = date; // date is already in YYYY-MM-DD format
  if (PUBLIC_HOLIDAYS.includes(dateStr)) {
    return 'Visits are not allowed on public holidays';
  }
  
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

// Utility function to get min date for visit scheduling (tomorrow)
export const getMinDateForVisit = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// Utility function to get max date for visit scheduling (tomorrow + 1 month)
export const getMaxDateForVisit = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

// Function to check if a date is valid for visits (Tuesday, Thursday, Saturday, not public holiday)
export const isDateValidForVisit = (dateStr) => {
  if (!dateStr) return false;
  
  const visitDate = new Date(dateStr);
  const dayOfWeek = visitDate.getDay(); // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  
  // Only allow Tuesday (2), Thursday (4), Saturday (6)
  if (![2, 4, 6].includes(dayOfWeek)) {
    return false;
  }
  
  // Check if it's a public holiday
  if (PUBLIC_HOLIDAYS.includes(dateStr)) {
    return false;
  }
  
  return true;
};

// Function to get the next valid visit date from a given date
export const getNextValidVisitDate = (fromDate = new Date()) => {
  const currentDate = new Date(fromDate);
  currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow
  
  // Look for the next valid date within 2 months
  for (let i = 0; i < 60; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (isDateValidForVisit(dateStr)) {
      return dateStr;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return null; // No valid date found
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
  if (exp > 39) return 'Experience cannot exceed 39 years';
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
