import React from 'react';
import AdminSidebar from './AdminSidebar';
import { FaSearch, FaBell } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children, title, subtitle }) => {
  const { user } = useAuth();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-72 p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={toggleFullscreen}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                title="Toggle Fullscreen"
              >
                ⛶
              </button>
              <div className="relative">
                <FaBell className="text-xl text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </div>
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
