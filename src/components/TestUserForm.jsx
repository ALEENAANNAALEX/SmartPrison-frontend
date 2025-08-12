import React, { useState } from 'react';
import ValidatedInput, { ValidatedSelect } from './ValidatedInput';

const TestUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    nationality: ''
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (name, value) => {
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, [name]: digitsOnly }));
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test User Form</h2>
      
      <div className="space-y-4">
        <ValidatedInput
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter name"
        />

        <ValidatedInput
          label="Email (Disabled Test)"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
          disabled={true}
          helperText="This field is disabled"
        />

        <ValidatedInput
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="Enter 10-digit mobile number"
          helperText="Must be 10 digits starting with 6, 7, 8, or 9"
          maxLength={10}
        />

        <ValidatedSelect
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ]}
          placeholder="Select gender"
        />

        <ValidatedInput
          label="Nationality"
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          placeholder="Enter nationality"
        />
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Form Data:</h3>
        <pre className="text-sm">{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TestUserForm;