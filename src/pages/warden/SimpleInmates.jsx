import React from 'react';

const SimpleInmates = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Inmates Management</h1>
          <p className="text-gray-600 mb-6">Manage and monitor all inmates</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900">Total Inmates</h3>
              <p className="text-2xl font-bold text-blue-600">156</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900">Active</h3>
              <p className="text-2xl font-bold text-green-600">142</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900">Isolation</h3>
              <p className="text-2xl font-bold text-red-600">8</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900">Medical</h3>
              <p className="text-2xl font-bold text-yellow-600">6</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Inmates</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">John Doe</h4>
                    <p className="text-sm text-gray-600">ID: INM001 • Block A • Cell A-101</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Jane Smith</h4>
                    <p className="text-sm text-gray-600">ID: INM002 • Block B • Cell B-205</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Mike Johnson</h4>
                    <p className="text-sm text-gray-600">ID: INM003 • Block A • Cell A-150</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Isolation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleInmates;
