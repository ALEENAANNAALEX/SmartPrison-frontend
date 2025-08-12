import { useState, useCallback, useEffect } from 'react';
import { validateForm } from '../utils/validation';

/**
 * Custom hook for real-time form validation
 * @param {Object} initialData - Initial form data
 * @param {Object} validationRules - Validation rules object
 * @param {Object} options - Additional options
 * @returns {Object} Form validation state and methods
 */
export const useFormValidation = (initialData, validationRules, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    asyncValidators = {}
  } = options;

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Debounce timer refs
  const debounceTimers = useState({})[0];

  // Validate a single field
  const validateField = useCallback(async (fieldName, value) => {
    if (!validationRules[fieldName]) return '';

    // Set validating state for async validators
    if (asyncValidators[fieldName]) {
      setIsValidating(prev => ({ ...prev, [fieldName]: true }));
    }

    try {
      let error = '';
      
      // Run synchronous validation first
      if (validationRules[fieldName]) {
        // Check if validation function expects formData as second parameter
        const validationFn = validationRules[fieldName];
        if (validationFn.length > 1) {
          error = validationFn(value, formData);
        } else {
          error = validationFn(value);
        }
      }

      // If sync validation passes and there's an async validator, run it
      if (!error && asyncValidators[fieldName]) {
        error = await asyncValidators[fieldName](value, formData);
      }

      return error;
    } catch (err) {
      console.error(`Validation error for field ${fieldName}:`, err);
      return 'Validation error occurred';
    } finally {
      if (asyncValidators[fieldName]) {
        setIsValidating(prev => ({ ...prev, [fieldName]: false }));
      }
    }
  }, [validationRules, asyncValidators, formData]);

  // Validate all fields
  const validateAllFields = useCallback(async () => {
    const newErrors = {};
    const validationPromises = [];

    Object.keys(validationRules).forEach(fieldName => {
      const value = getNestedValue(formData, fieldName);
      validationPromises.push(
        validateField(fieldName, value).then(error => {
          if (error) {
            newErrors[fieldName] = error;
          }
        })
      );
    });

    await Promise.all(validationPromises);
    setErrors(newErrors);
    
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  }, [formData, validateField, validationRules]);

  // Handle field change with debounced validation
  const handleFieldChange = useCallback((fieldName, value) => {
    // Update form data immediately
    setFormData(prev => setNestedValue(prev, fieldName, value));

    // Mark field as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Clear existing debounce timer
    if (debounceTimers[fieldName]) {
      clearTimeout(debounceTimers[fieldName]);
    }

    // Set up debounced validation
    if (validateOnChange && touched[fieldName]) {
      debounceTimers[fieldName] = setTimeout(async () => {
        const error = await validateField(fieldName, value);
        setErrors(prev => ({
          ...prev,
          [fieldName]: error
        }));
      }, debounceMs);
    }
  }, [validateOnChange, validateField, debounceMs, touched, debounceTimers]);

  // Handle field blur
  const handleFieldBlur = useCallback(async (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    if (validateOnBlur) {
      const value = getNestedValue(formData, fieldName);
      const error = await validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  }, [validateOnBlur, validateField, formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
    setIsValidating({});
    setIsValid(false);
    
    // Clear all debounce timers
    Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
    Object.keys(debounceTimers).forEach(key => delete debounceTimers[key]);
  }, [initialData, debounceTimers]);

  // Update form data (for external updates)
  const updateFormData = useCallback((newData) => {
    setFormData(newData);
  }, []);

  // Get field error (only show if field is touched)
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : '';
  }, [errors, touched]);

  // Check if field is validating
  const isFieldValidating = useCallback((fieldName) => {
    return isValidating[fieldName] || false;
  }, [isValidating]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName) => {
    return touched[fieldName] && !!errors[fieldName];
  }, [errors, touched]);

  // Check if field is valid
  const isFieldValid = useCallback((fieldName) => {
    return touched[fieldName] && !errors[fieldName];
  }, [errors, touched]);

  // Effect to validate form when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(touched).length > 0) {
        validateAllFields();
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [formData, touched, debounceMs]); // Removed validateAllFields from dependencies to prevent infinite loop

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach(timer => clearTimeout(timer));
    };
  }, [debounceTimers]);

  return {
    formData,
    errors,
    touched,
    isValid,
    isValidating,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    resetForm,
    updateFormData,
    getFieldError,
    isFieldValidating,
    hasFieldError,
    isFieldValid,
    setFormData,
    setErrors,
    setTouched
  };
};

// Helper functions
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const newObj = { ...obj };
  let current = newObj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    } else {
      current[key] = { ...current[key] };
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return newObj;
};

export default useFormValidation;