import React, { useState } from 'react';
import { FaCheck, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Validated Input Component with real-time validation feedback
 */
const ValidatedInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,

  error,
  isValidating = false,
  isValid = false,
  placeholder,
  required = false,
  disabled = false,
  helperText = '',
  maxLength,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(name);
    }
  };



  const getInputClassName = () => {
    let baseClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${inputClassName}`;
    
    // Add right padding for password toggle button or validation icon
    if (isPasswordField || isValidating || error) {
      baseClass += ' pr-10';
    }
    
    if (disabled) {
      baseClass += ' bg-gray-100 cursor-not-allowed';
    }
    
    if (error) {
      baseClass += ' border-red-500 focus:ring-red-500';
    } else {
      baseClass += ' border-gray-300';
    }
    
    return baseClass;
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <FaSpinner className="animate-spin text-blue-500" />;
    }
    
    if (error) {
      return <FaExclamationTriangle className="text-red-500" />;
    }
    
    return null;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}

          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={getInputClassName()}
          {...props}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isPasswordField ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          ) : (
            getValidationIcon()
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center space-x-1 text-sm text-red-600">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      

      
      {helperText && !error && (
        <div className="text-sm text-gray-500">
          {helperText}
        </div>
      )}
    </div>
  );
};

/**
 * Validated Select Component
 */
export const ValidatedSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  isValid = false,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  selectClassName = '',
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(name);
    }
  };

  const getSelectClassName = () => {
    let baseClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${selectClassName}`;
    
    if (disabled) {
      baseClass += ' bg-gray-100 cursor-not-allowed';
    }
    
    if (error) {
      baseClass += ' border-red-500 focus:ring-red-500';
    } else {
      baseClass += ' border-gray-300';
    }
    
    return baseClass;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={getSelectClassName()}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <div className="absolute inset-y-0 right-8 pr-3 flex items-center pointer-events-none">
            <FaExclamationTriangle className="text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-1 text-sm text-red-600">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      

    </div>
  );
};

/**
 * Validated Textarea Component
 */
export const ValidatedTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  isValid = false,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
  textareaClassName = '',
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(name);
    }
  };

  const getTextareaClassName = () => {
    let baseClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-vertical ${textareaClassName}`;
    
    if (disabled) {
      baseClass += ' bg-gray-100 cursor-not-allowed';
    }
    
    if (error) {
      baseClass += ' border-red-500 focus:ring-red-500';
    } else {
      baseClass += ' border-gray-300';
    }
    
    return baseClass;
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={getTextareaClassName()}
          {...props}
        />
        
        {error && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <FaExclamationTriangle className="text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-1 text-sm text-red-600">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      

    </div>
  );
};

/**
 * Validated Checkbox Component
 */
export const ValidatedCheckbox = ({
  label,
  name,
  checked,
  onChange,
  onBlur,
  error,
  disabled = false,
  className = '',
  checkboxClassName = '',
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.checked);
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(name);
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked || false}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${checkboxClassName}`}
          {...props}
        />
        {label && (
          <label className="ml-2 block text-sm text-gray-900">
            {label}
          </label>
        )}
      </div>
      
      {error && (
        <div className="flex items-center space-x-1 text-sm text-red-600">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;