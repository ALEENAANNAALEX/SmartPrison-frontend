import React from 'react';
import { Link } from 'react-router-dom';

const RouteTest = () => {
  const wardenRoutes = [
    { path: '/warden/dashboard', label: 'Dashboard' },
    { path: '/warden/inmates', label: 'Inmates Management' },
    { path: '/warden/staff', label: 'Staff Management' },
    { path: '/warden/schedule', label: 'Schedule Management' },
    { path: '/warden/reports', label: 'Reports Management' },
    { path: '/warden/behavior', label: 'Behavior Analytics' },
    { path: '/warden/leaves', label: 'Leave Requests' },
    { path: '/warden/paroles', label: 'Parole Requests' },
    { path: '/warden/rehabilitation', label: 'Rehabilitation Programs' },
    { path: '/warden/settings', label: 'Settings' }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Warden Route Test</h1>
      <div className="grid grid-cols-2 gap-4">
        {wardenRoutes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className="block p-4 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-300 transition-colors"
          >
            <div className="font-medium">{route.label}</div>
            <div className="text-sm text-gray-600">{route.path}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RouteTest;