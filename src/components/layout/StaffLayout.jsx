import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaFileAlt,
  FaCalendarAlt,
  FaChartLine,
  FaUserClock,
  FaCamera,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaExclamationTriangle,
  FaStar
} from 'react-icons/fa';

const StaffLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/staff/dashboard', icon: FaHome, label: 'Dashboard' },

    // INMATE MANAGEMENT
    { section: 'INMATE MANAGEMENT' },
    { path: '/staff/inmates', icon: FaUsers, label: 'View Inmates' },
    { path: '/staff/attendance', icon: FaCamera, label: 'Face Recognition Attendance' },
    { path: '/staff/behavior-ratings', icon: FaStar, label: 'Behavior Ratings' },

    // REPORTS & INCIDENTS
    { section: 'REPORTS & INCIDENTS' },
    { path: '/staff/report-incidents', icon: FaExclamationTriangle, label: 'Report Incidents' },
    { path: '/staff/reports', icon: FaFileAlt, label: 'My Reports' },

    // COUNSELING & SESSIONS
    { section: 'COUNSELING' },
    { path: '/staff/counseling', icon: FaComments, label: 'Counseling Sessions' },
    { path: '/staff/schedule', icon: FaCalendarAlt, label: 'My Schedule' },

    // PERSONAL
    { section: 'PERSONAL' },
    { path: '/staff/leave-requests', icon: FaUserClock, label: 'Leave Requests' },
    { path: '/staff/settings', icon: FaCog, label: 'Settings' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-br from-gray-700 to-gray-800 text-white flex flex-col fixed h-screen shadow-2xl">
        <div className="p-8 border-b border-white/10 text-center">
          <h2 className="text-2xl font-bold mb-1">🏛️ Smart Prison</h2>
          <span className="text-sm opacity-80">Staff</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              if (item.section) {
                return (
                  <li key={index} className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider border-b border-white/10 mt-4 mb-2">
                    {item.section}
                  </li>
                );
              }

              const Icon = item.icon;
              return (
                <li
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`mx-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center px-4 py-3">
                    <Icon className="mr-3 text-lg" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-bold">{user?.name?.charAt(0) || 'S'}</span>
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name || 'Staff Member'}</p>
              <p className="text-xs opacity-70">Staff</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72 p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title || 'Staff Dashboard'}</h1>
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.name || 'Staff Member'}
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

export default StaffLayout;
