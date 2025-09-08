import React from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children, title, subtitle }) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-72 p-6 md:p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{title}</h1>
              {subtitle && <p className="text-gray-600 text-sm md:text-base">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

// File purpose: Shared admin page layout with sidebar and header (search only) and content slot.
// Frontend location: Used by all Admin pages (e.g., /admin/* routes) to provide consistent UI.
// Dependencies: AdminSidebar, AuthContext; Tailwind CSS for styling.
