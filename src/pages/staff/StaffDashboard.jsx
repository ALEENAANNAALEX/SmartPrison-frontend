import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import StaffLayout from '../../components/layout/StaffLayout';
import {
  FaUsers,
  FaFileAlt,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaCamera,
  FaComments,
  FaUserClock,
  FaChartLine,
  FaBell,
  FaKey,
  FaTimes
} from 'react-icons/fa';

// StatCard Component
const StatCard = ({ icon: Icon, title, value, color, trend, onClick }) => (
  <div 
    onClick={onClick}
    className={`${color} rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 ${trend.positive ? 'text-green-200' : 'text-red-200'}`}>
            {trend.value}
          </p>
        )}
      </div>
      <div className="bg-white/20 p-4 rounded-xl">
        <Icon className="text-2xl" />
      </div>
    </div>
  </div>
);

// AlertCard Component
const AlertCard = ({ alert }) => (
  <div className={`p-4 rounded-xl border-l-4 ${
    alert.priority === 'high' ? 'bg-red-50 border-red-400' :
    alert.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
    'bg-blue-50 border-blue-400'
  }`}>
    <div className="flex items-start">
      <div className={`p-2 rounded-full mr-3 ${
        alert.priority === 'high' ? 'bg-red-100 text-red-600' :
        alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
        'bg-blue-100 text-blue-600'
      }`}>
        <FaBell className="text-sm" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
        <p className="text-gray-600 text-sm mt-1">{alert.message}</p>
        <p className="text-gray-500 text-xs mt-2">{alert.time}</p>
      </div>
    </div>
  </div>
);

const StaffDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [stats, setStats] = useState({
    assignedInmates: 24,
    pendingReports: 3,
    todaySchedule: 5,
    behaviorRatings: 18,
    incidentsReported: 2,
    counselingSessions: 4,
    leaveRequests: 1,
    attendanceMarked: 22
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      type: 'behavior',
      title: 'Behavior Rating Submitted',
      description: 'Weekly behavior rating for John Doe completed',
      time: '2 hours ago'
    },
    {
      type: 'incident',
      title: 'Incident Reported',
      description: 'Minor altercation in Block A cafeteria',
      time: '4 hours ago'
    },
    {
      type: 'counseling',
      title: 'Counseling Session',
      description: 'Completed session with inmate Mike Johnson',
      time: '6 hours ago'
    },
    {
      type: 'attendance',
      title: 'Attendance Marked',
      description: 'Face recognition attendance for morning shift',
      time: '8 hours ago'
    }
  ]);

  const [alerts, setAlerts] = useState([
    {
      priority: 'high',
      title: 'Overdue Report',
      message: 'Weekly behavior report for Block A is overdue',
      time: '1 hour ago'
    },
    {
      priority: 'medium',
      title: 'Counseling Session',
      message: 'Scheduled session with inmate at 2:00 PM today',
      time: '30 minutes ago'
    },
    {
      priority: 'low',
      title: 'Leave Request',
      message: 'Your leave request has been approved',
      time: '2 hours ago'
    }
  ]);

  const [todaySchedule, setTodaySchedule] = useState([
    { time: '09:00', activity: 'Morning Attendance Check', location: 'Block A' },
    { time: '10:30', activity: 'Counseling Session - John Doe', location: 'Counseling Room 1' },
    { time: '14:00', activity: 'Behavior Rating Review', location: 'Office' },
    { time: '15:30', activity: 'Incident Report Follow-up', location: 'Security Office' },
    { time: '16:00', activity: 'Evening Attendance Check', location: 'Block A' }
  ]);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <StaffLayout title="Staff Dashboard" subtitle="Welcome to your staff control panel">
      <div className="space-y-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaUsers}
            title="Assigned Inmates"
            value={stats.assignedInmates}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={{ positive: true, value: "Block A & B" }}
            onClick={() => window.location.href = '/staff/inmates'}
          />
          <StatCard
            icon={FaStar}
            title="Behavior Ratings"
            value={stats.behaviorRatings}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={{ positive: true, value: "6 pending" }}
            onClick={() => window.location.href = '/staff/behavior-ratings'}
          />
          <StatCard
            icon={FaExclamationTriangle}
            title="Incidents Reported"
            value={stats.incidentsReported}
            color="bg-gradient-to-r from-red-500 to-red-600"
            trend={{ positive: false, value: "This week" }}
            onClick={() => window.location.href = '/staff/incidents'}
          />
          <StatCard
            icon={FaComments}
            title="Counseling Sessions"
            value={stats.counselingSessions}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={{ positive: true, value: "2 scheduled today" }}
            onClick={() => window.location.href = '/staff/counseling'}
          />
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaFileAlt}
            title="Pending Reports"
            value={stats.pendingReports}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            trend={{ positive: false, value: "1 overdue" }}
            onClick={() => window.location.href = '/staff/reports'}
          />
          <StatCard
            icon={FaCamera}
            title="Attendance Marked"
            value={stats.attendanceMarked}
            color="bg-gradient-to-r from-teal-500 to-teal-600"
            trend={{ positive: true, value: "Today" }}
            onClick={() => window.location.href = '/staff/attendance'}
          />
          <StatCard
            icon={FaCalendarAlt}
            title="Today's Schedule"
            value={stats.todaySchedule}
            color="bg-gradient-to-r from-indigo-500 to-indigo-600"
            trend={{ positive: true, value: "activities" }}
            onClick={() => window.location.href = '/staff/schedule'}
          />
          <StatCard
            icon={FaUserClock}
            title="Leave Requests"
            value={stats.leaveRequests}
            color="bg-gradient-to-r from-pink-500 to-pink-600"
            trend={{ positive: true, value: "1 approved" }}
            onClick={() => window.location.href = '/staff/leave-requests'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <span className="text-sm text-gray-500">Last 24 hours</span>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`p-3 rounded-xl ${
                      activity.type === 'behavior' ? 'bg-green-100 text-green-600' :
                      activity.type === 'incident' ? 'bg-red-100 text-red-600' :
                      activity.type === 'counseling' ? 'bg-purple-100 text-purple-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'behavior' ? <FaStar className="text-lg" /> :
                       activity.type === 'incident' ? <FaExclamationTriangle className="text-lg" /> :
                       activity.type === 'counseling' ? <FaComments className="text-lg" /> :
                       <FaCamera className="text-lg" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{activity.title}</p>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FaBell className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Alerts</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {alerts.length} Active
              </span>
            </div>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <AlertCard key={index} alert={alert} />
                ))
              ) : (
                <div className="text-center py-12">
                  <FaCheckCircle className="text-4xl text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Today's Schedule</h3>
          <div className="space-y-4">
            {todaySchedule.map((item, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4">
                  <FaClock className="text-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{item.activity}</h4>
                    <span className="text-sm font-medium text-indigo-600">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/staff/reports/create'}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-center transition-all duration-200 border border-blue-200 hover:border-blue-300"
            >
              <FaFileAlt className="text-3xl text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-blue-900">Create Report</p>
              <p className="text-xs text-blue-700 mt-1">Submit daily report</p>
            </button>
            <button
              onClick={() => window.location.href = '/staff/behavior-ratings'}
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-center transition-all duration-200 border border-green-200 hover:border-green-300"
            >
              <FaStar className="text-3xl text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-green-900">Rate Behavior</p>
              <p className="text-xs text-green-700 mt-1">Submit behavior ratings</p>
            </button>
            <button
              onClick={() => window.location.href = '/staff/attendance'}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-center transition-all duration-200 border border-purple-200 hover:border-purple-300"
            >
              <FaCamera className="text-3xl text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-purple-900">Mark Attendance</p>
              <p className="text-xs text-purple-700 mt-1">Daily attendance check</p>
            </button>
            <button
              onClick={() => setShowChangePassword(true)}
              className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl text-center transition-all duration-200 border border-orange-200 hover:border-orange-300"
            >
              <FaKey className="text-3xl text-orange-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-orange-900">Change Password</p>
              <p className="text-xs text-orange-700 mt-1">Update account password</p>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}
    </StaffLayout>
  );
};

// Change Password Modal Component
function ChangePasswordModal({ onClose, showSuccess, showError }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
    return '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    let error = '';
    if (field === 'currentPassword' && !value) {
      error = 'Current password is required';
    } else if (field === 'newPassword') {
      error = validatePassword(value);
    } else if (field === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password';
      } else if (value !== formData.newPassword) {
        error = 'Passwords do not match';
      }
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const validationErrors = {};

    if (!formData.currentPassword) {
      validationErrors.currentPassword = 'Current password is required';
    }

    const newPasswordError = validatePassword(formData.newPassword);
    if (newPasswordError) {
      validationErrors.newPassword = newPasswordError;
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.newPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showSuccess('Password changed successfully!', 'Password Updated');
        onClose();
      } else {
        showError(data.msg || 'Failed to change password', 'Password Change Failed');
      }
    } catch (error) {
      showError('Network error. Please try again.', 'Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
