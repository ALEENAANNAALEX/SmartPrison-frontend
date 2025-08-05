import React from 'react';
import StaffLayout from '../../components/layout/StaffLayout';

const TestStaff = () => {
  return (
    <StaffLayout title="Test Staff Page" subtitle="Testing staff page functionality">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Staff Page</h1>
        <p className="text-gray-600">
          This is a test page to check if staff pages are working correctly.
        </p>
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700">✅ If you can see this, the staff page is working!</p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default TestStaff;
