import React from 'react';
import WardenLayout from '../../components/layout/WardenLayout';

const InmatesManagement = () => {
  return (
    <WardenLayout title="Inmates Management" subtitle="Manage and monitor all inmates">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inmates Management</h3>
          <p className="text-gray-600">This page is working! The complex version will be added back once we fix the issue.</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900">Total Inmates</h4>
              <p className="text-2xl font-bold text-blue-600">156</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900">Active</h4>
              <p className="text-2xl font-bold text-green-600">142</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900">Isolation</h4>
              <p className="text-2xl font-bold text-red-600">8</p>
            </div>
          </div>
        </div>
      </div>
    </WardenLayout>
  );
};

export default InmatesManagement;
