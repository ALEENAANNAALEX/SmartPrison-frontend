import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSave,
  FaEdit,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const WardenSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: '',
    rank: '',
    facility: '',
    employeeId: ''
  });
  
  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    fetchWardenDetails();
  }, []);

  const fetchWardenDetails = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/warden/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.details) {
          setProfileData({
            name: data.details.personalInfo?.fullName || user?.name || '',
            email: data.details.userEmail || user?.email || '',
            phone: data.details.contactInfo?.primaryPhone || '',
            department: data.details.roleSpecificDetails?.wardenDetails?.department || '',
            rank: data.details.roleSpecificDetails?.wardenDetails?.rank || '',
            facility: data.details.roleSpecificDetails?.wardenDetails?.facility || '',
            employeeId: data.details.roleSpecificDetails?.wardenDetails?.employeeId || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching warden details:', error);
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (!/(?=.*[a-zA-Z])/.test(password)) {
      errors.push('Password must contain at least one letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
    
    // Real-time validation
    const newErrors = { ...passwordErrors };
    
    if (field === 'newPassword') {
      const errors = validatePassword(value);
      if (errors.length > 0) {
        newErrors.newPassword = errors;
      } else {
        delete newErrors.newPassword;
      }
    }
    
    if (field === 'confirmPassword' || (field === 'newPassword' && passwordData.confirmPassword)) {
      const newPass = field === 'newPassword' ? value : passwordData.newPassword;
      const confirmPass = field === 'confirmPassword' ? value : passwordData.confirmPassword;
      
      if (newPass !== confirmPass) {
        newErrors.confirmPassword = ['Passwords do not match'];
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    setPasswordErrors(newErrors);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate all fields
    const newPasswordErrors = validatePassword(passwordData.newPassword);
    if (newPasswordErrors.length > 0) {
      setPasswordErrors({ newPassword: newPasswordErrors });
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: ['Passwords do not match'] });
      setLoading(false);
      return;
    }
    
    if (!passwordData.currentPassword) {
      setPasswordErrors({ currentPassword: ['Current password is required'] });
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          message: '✅ Password changed successfully!'
        });
        
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
        
        // Clear notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      } else {
        setNotification({
          type: 'error',
          message: `❌ ${data.msg || 'Failed to change password'}`
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Password change error:', error);
      setNotification({
        type: 'error',
        message: '❌ Network error. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  return (
    <WardenLayout title="Settings" subtitle="Manage your account and preferences">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline mr-2" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaLock className="inline mr-2" />
                Change Password
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                    <input
                      type="text"
                      value={profileData.employeeId}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={profileData.department}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
                    <input
                      type="text"
                      value={profileData.rank}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facility</label>
                    <input
                      type="text"
                      value={profileData.facility}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <FaEdit className="inline mr-2" />
                    To update your profile information, please contact your administrator.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          passwordErrors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword[0]}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          passwordErrors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <div className="mt-1">
                        {passwordErrors.newPassword.map((error, index) => (
                          <p key={index} className="text-sm text-red-600">{error}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          passwordErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <FaEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FaEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword[0]}</p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center">
                        <FaCheck className="h-3 w-3 text-green-500 mr-2" />
                        At least 6 characters long
                      </li>
                      <li className="flex items-center">
                        <FaCheck className="h-3 w-3 text-green-500 mr-2" />
                        Contains at least one letter
                      </li>
                      <li className="flex items-center">
                        <FaCheck className="h-3 w-3 text-green-500 mr-2" />
                        Contains at least one number
                      </li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading || Object.keys(passwordErrors).length > 0}
                      className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <FaSave className="mr-2" />
                      )}
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </WardenLayout>
  );
};

export default WardenSettings;
