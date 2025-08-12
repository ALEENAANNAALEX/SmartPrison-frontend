import React from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import ValidatedInput from './ValidatedInput';
import { userCreationValidationRules, validateEmailUniqueness } from '../utils/validation';

const ValidationTest = () => {
  const initialData = {
    name: '',
    email: '',
    password: ''
  };

  const {
    formData,
    errors,
    touched,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    getFieldError,
    isFieldValidating,
    hasFieldError,
    isFieldValid
  } = useFormValidation(
    initialData,
    userCreationValidationRules,
    {
      validateOnChange: true,
      validateOnBlur: true,
      debounceMs: 500,
      asyncValidators: {
        email: (email) => validateEmailUniqueness(email)
      }
    }
  );

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Validation Test</h2>
      
      <div className="space-y-4">
        <ValidatedInput
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          error={getFieldError('name')}
          isValidating={isFieldValidating('name')}
          isValid={isFieldValid('name')}
          placeholder="Enter your name"
          required
        />

        <ValidatedInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          error={getFieldError('email')}
          isValidating={isFieldValidating('email')}
          isValid={isFieldValid('email')}
          placeholder="Enter your email"
          required
        />

        <ValidatedInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleFieldChange}
          onBlur={handleFieldBlur}
          error={getFieldError('password')}
          isValidating={isFieldValidating('password')}
          isValid={isFieldValid('password')}
          placeholder="Enter your password"
          required
        />
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Form Valid: {isValid ? 'Yes' : 'No'}</p>
        <p>Errors: {JSON.stringify(errors)}</p>
        <p>Touched: {JSON.stringify(touched)}</p>
      </div>
    </div>
  );
};

export default ValidationTest;