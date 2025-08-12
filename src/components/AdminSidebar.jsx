import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaUsers,
  FaUserShield,
  FaCalendarCheck,
  FaCog,
  FaSignOutAlt,
  FaBuilding,
  FaUserTie,
  FaFileAlt,
  FaClipboardList,
  FaShieldAlt,
  FaHome
} from 'react-icons/fa';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    
    // Prison Management
    { section: 'PRISON MANAGEMENT' },
    { path: '/admin/blocks', icon: FaBuilding, label: 'Prison Blocks' },
    { path: '/admin/wardens', icon: FaUserTie, label: 'Manage Wardens' },
    { path: '/admin/prisoners', icon: FaUserShield, label: 'Add Prisoners' },
    
    // Reports & Monitoring
    { section: 'REPORTS & MONITORING' },
    { path: '/admin/behavioral-reports', icon: FaFileAlt, label: 'Behavioral Reports' },
    { path: '/admin/activity-reports', icon: FaClipboardList, label: 'Activity & Incident Reports' },
    
    // Rules & Policies
    { section: 'RULES & POLICIES' },
    { path: '/admin/visit-rules', icon: FaCalendarCheck, label: 'Visit Rules' },
    { path: '/admin/prison-rules', icon: FaShieldAlt, label: 'Prison Rules' },
    
    // User Management
    { section: 'USER MANAGEMENT' },
    { path: '/admin/users', icon: FaUsers, label: 'All Users' },
    
    // System
    { section: 'SYSTEM' },
    { path: '/admin/settings', icon: FaCog, label: 'Settings' }
  ];

  return (
    <div className="w-72 bg-gradient-to-br from-gray-700 to-gray-800 text-white flex flex-col fixed h-screen shadow-2xl">
      <div className="p-8 border-b border-white/10 text-center">
        <h2 className="text-2xl font-bold mb-1">🏛️ Smart Prison</h2>
        <span className="text-sm opacity-80">Admin</span>
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
                className={`px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer ${
                  isActive(item.path) ? 'bg-white/20 border-r-4 border-white' : ''
                }`}
              >
                <Icon className="text-lg" /> {item.label}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-white/10 hover:bg-white/20 transition-colors duration-200 px-4 py-3 rounded-lg flex items-center gap-3 font-medium"
        >
          <FaSignOutAlt className="text-lg" /> Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
