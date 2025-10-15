import React, { useState } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const StaffSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Reset password state (mirrors warden reset password UI)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Placeholder save
      await new Promise(r => setTimeout(r, 500));
      setMessage({ type: 'success', text: 'Settings saved.' });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateNewPassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push('Must be at least 8 characters');
    // Uppercase is NOT required as requested
    // Lowercase is also not strictly required; ensure at least one number for strength
    if (!/[0-9]/.test(pwd)) errors.push('Include at least one number');
    return errors;
  };

  const handlePasswordChange = (field, value) => {
    const updated = { ...passwordData, [field]: value };
    setPasswordData(updated);
    const errs = {};
    if (!updated.currentPassword) errs.currentPassword = ['Current password is required'];
    const newErrs = validateNewPassword(updated.newPassword);
    if (newErrs.length) errs.newPassword = newErrs;
    if (updated.confirmPassword !== updated.newPassword) errs.confirmPassword = ['Passwords do not match'];
    setPasswordErrors(errs);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    // final validate
    const errs = {};
    if (!passwordData.currentPassword) errs.currentPassword = ['Current password is required'];
    const newErrs = validateNewPassword(passwordData.newPassword);
    if (newErrs.length) errs.newPassword = newErrs;
    if (passwordData.confirmPassword !== passwordData.newPassword) errs.confirmPassword = ['Passwords do not match'];
    setPasswordErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setSaving(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      // Align with existing endpoints used elsewhere (PUT /api/user/change-password)
      const res = await fetch(`${API_BASE}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.msg || 'Failed to update password.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <StaffLayout title="Settings" subtitle="Manage your staff account preferences">
      {/* Tabs */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 px-6 pt-4 max-w-6xl">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${activeTab === 'profile' ? 'text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-600'} px-2 py-2 font-medium`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`${activeTab === 'password' ? 'text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-600'} px-2 py-2 font-medium`}
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Profile card - match warden style */}
      {activeTab === 'profile' && (
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6 max-w-6xl">
        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input type="text" value={user?.name || name} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="text" value={user?.email || email} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <input type="text" value={user?.employeeId || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input type="text" value={user?.department || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
            <input type="text" value={user?.rank || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facility</label>
            <input type="text" value={user?.facility || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-700">To update your profile information, please contact your administrator.</p>
        </div>
      </div>
      )}

      {activeTab === 'password' && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${passwordErrors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Enter your current password"
                  required
                />
                <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPasswords.current ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
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
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${passwordErrors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Enter your new password"
                  required
                />
                <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPasswords.new ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <div className="mt-1">
                  {passwordErrors.newPassword.map((err, i) => (
                    <p key={i} className="text-sm text-red-600">{err}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${passwordErrors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Confirm your new password"
                  required
                />
                <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPasswords.confirm ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword[0]}</p>
              )}
            </div>

            <div className="pt-2">
              <button disabled={saving || Object.keys(passwordErrors).length > 0} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
      </div>
      )}
    </StaffLayout>
  );
};

export default StaffSettings;


