import React, { useState, useEffect } from 'react'; // React + hooks
import AdminLayout from '../../components/AdminLayout'; // Admin layout wrapper
import { FaCog, FaSave, FaShieldAlt, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa'; // Icons for settings UI
import { useNotification } from '../../contexts/NotificationContext'; // Notification system

// Section: Component blueprint
// - State: activeTab, loading flag, settings object (general, security, visits)
// - Effects: load settings on mount
// - API: fetch settings; save per-category settings
// - Handlers: updateSetting per field, tab switching, section save
// - Render: tabbed panels with forms and save buttons

const Settings = () => {
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [totalBlockCapacity, setTotalBlockCapacity] = useState(0);
  
  // Reset Password state
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
  const [settings, setSettings] = useState({
    general: {
      prisonName: 'Smart Prison Management System',
      address: '',
      phone: '',
      email: '',
      capacity: 1000
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireSpecialChars: true,
      maxLoginAttempts: 3,
      lockoutDuration: 15
    },
    visits: {
      maxVisitorsPerSession: 3,
      visitDuration: 60,
      advanceBookingDays: 7,
      dailyVisitSlots: 8,
      weekendVisits: true,
      holidayVisits: false
    }
  });

  useEffect(() => {
    fetchSettings();
    fetchBlockCapacity();
  }, []);

  const fetchBlockCapacity = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/blocks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const total = data.blocks.reduce((sum, block) => sum + (block.totalCapacity || 0), 0);
          setTotalBlockCapacity(total);
        }
      }
    } catch (error) {
      console.error('Error fetching block capacity:', error);
    }
  };

  const validateField = (category, key, value) => {
    const errors = { ...validationErrors };
    const fieldKey = `${category}.${key}`;

    // Clear previous error
    delete errors[fieldKey];

    // Validation rules
    switch (key) {
      case 'prisonName':
        if (!value || value.trim().length < 3) {
          errors[fieldKey] = 'Prison name must be at least 3 characters long';
        } else if (!/^[A-Za-z\s]+$/.test(value.trim())) {
          errors[fieldKey] = 'Prison name must contain only alphabets and spaces';
        }
        break;
      case 'phone':
        // 10-digit number starting with 6-9
        if (value && !/^[6-9]\d{9}$/.test(String(value).trim())) {
          errors[fieldKey] = 'Phone must be 10 digits starting with 6-9';
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldKey] = 'Please enter a valid email address';
        }
        break;
      case 'capacity':
        const numValue = parseInt(value);
        if (!numValue || numValue < 1) {
          errors[fieldKey] = 'Capacity must be at least 1';
        } else if (totalBlockCapacity > 0 && numValue < totalBlockCapacity) {
          errors[fieldKey] = `Total capacity (${numValue}) cannot be less than current block capacity (${totalBlockCapacity}). Please reduce block capacities first or increase this value.`;
        }
        break;
      case 'sessionTimeout':
        if (!value || value < 5 || value > 480) {
          errors[fieldKey] = 'Session timeout must be between 5 and 480 minutes';
        }
        break;
      case 'passwordMinLength':
        if (!value || value < 6 || value > 50) {
          errors[fieldKey] = 'Password length must be between 6 and 50 characters';
        }
        break;
      case 'maxLoginAttempts':
        if (!value || value < 1 || value > 10) {
          errors[fieldKey] = 'Max login attempts must be between 1 and 10';
        }
        break;
      case 'lockoutDuration':
        if (!value || value < 1 || value > 1440) {
          errors[fieldKey] = 'Lockout duration must be between 1 and 1440 minutes';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchSettings = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } else {
        const data = await response.json();
        showError(data.msg || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showError('Network error. Please try again.');
    }
  };

  const handleSave = async (category) => {
    // Check for validation errors before saving
    const categoryErrors = Object.keys(validationErrors).filter(key => key.startsWith(`${category}.`));
    if (categoryErrors.length > 0) {
      showError('Please fix all validation errors before saving.');
      return;
    }

    // Special validation for capacity vs block capacity
    if (category === 'general' && totalBlockCapacity > 0 && settings.general.capacity < totalBlockCapacity) {
      showError(`Cannot save: Total capacity (${settings.general.capacity}) is less than current block capacity (${totalBlockCapacity}). Please increase the total capacity or reduce block capacities first.`);
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/settings/${category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings[category])
      });

      if (response.ok) {
        showSuccess('Settings saved successfully!');
      } else {
        const data = await response.json();
        showError(data.msg || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const updateSetting = (category, key, value) => {
    // Update the setting
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));

    // Validate the field in real-time
    validateField(category, key, value);
  };

  // Password validation functions
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-zA-Z])/.test(password)) {
      errors.push('Password must contain at least one letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    return errors;
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Clear previous errors
    setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    
    // Real-time validation
    if (field === 'newPassword') {
      const passwordValidationErrors = validatePassword(value);
      if (passwordValidationErrors.length > 0) {
        setPasswordErrors(prev => ({ ...prev, newPassword: passwordValidationErrors[0] }));
      }
      
      // Check confirm password match if it exists
      if (passwordData.confirmPassword && value !== passwordData.confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (passwordData.confirmPassword && value === passwordData.confirmPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    
    if (field === 'confirmPassword') {
      if (value !== passwordData.newPassword) {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    
    // Current password required
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordValidationErrors = validatePassword(passwordData.newPassword);
      if (passwordValidationErrors.length > 0) {
        newErrors.newPassword = passwordValidationErrors[0];
      }
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) {
        showError('Admin session expired. Please log in again.');
        setLoading(false);
        return;
      }
      console.log('\uD83D\uDD10 Resetting admin password via /api/admin/reset-password', { hasToken: !!token });
      const response = await fetch('http://localhost:5000/api/admin/reset-password', {
        method: 'POST',
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
      
      if (response.ok) {
        showSuccess('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
      } else {
        showError(data.msg || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'password', label: 'Reset Password', icon: FaKey }
  ];

  return (
    <AdminLayout title="System Settings" subtitle="Configure system preferences and security">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prison Name</label>
                <input
                  type="text"
                  value={settings.general.prisonName}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/[^A-Za-z\s]/g, '');
                    updateSetting('general', 'prisonName', sanitized);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors['general.prisonName'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors['general.prisonName'] && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors['general.prisonName']}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={settings.general.address}
                  onChange={(e) => updateSetting('general', 'address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={settings.general.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateSetting('general', 'phone', digits);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors['general.phone'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['general.phone'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['general.phone']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.general.email}
                    onChange={(e) => updateSetting('general', 'email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors['general.email'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['general.email'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['general.email']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Capacity
                    {totalBlockCapacity > 0 && (
                      <span className="text-sm text-gray-500 ml-2">(Block total: {totalBlockCapacity})</span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={settings.general.capacity}
                    onChange={(e) => updateSetting('general', 'capacity', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors['general.capacity'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['general.capacity'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['general.capacity']}</p>
                  )}
                </div>
              </div>
              

              
              <button
                onClick={() => handleSave('general')}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave /> Save General Settings
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors['security.sessionTimeout'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['security.sessionTimeout'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['security.sessionTimeout']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Minimum Length</label>
                  <input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors['security.passwordMinLength'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['security.passwordMinLength'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['security.passwordMinLength']}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors['security.maxLoginAttempts'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['security.maxLoginAttempts'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['security.maxLoginAttempts']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lockout Duration (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.lockoutDuration}
                    onChange={(e) => updateSetting('security', 'lockoutDuration', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors['security.lockoutDuration'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['security.lockoutDuration'] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors['security.lockoutDuration']}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireSpecialChars"
                    checked={settings.security.requireSpecialChars}
                    onChange={(e) => updateSetting('security', 'requireSpecialChars', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-900">
                    Require special characters in passwords
                  </label>
                </div>
              </div>
              
              <button
                onClick={() => handleSave('security')}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave /> Save Security Settings
              </button>
            </div>
          )}





          {/* Reset Password */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
              <p className="text-gray-600">Update your admin account password for security</p>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        passwordErrors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        passwordErrors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Password must be at least 8 characters with letters, numbers, and special characters (@$!%*?&)
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        passwordErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaSave />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;

// File purpose: Admin settings page with tabs for General, Security, and Visit settings; saves per category.
// Frontend location: Route /admin/settings (Admin > System Settings) via App.jsx routing.
// Backend endpoints used: GET http://localhost:5000/api/admin/settings; PUT http://localhost:5000/api/admin/settings/:category.
// Auth: Requires Bearer token from sessionStorage.
// UI container: AdminLayout; tabbed interface using Tailwind classes.
