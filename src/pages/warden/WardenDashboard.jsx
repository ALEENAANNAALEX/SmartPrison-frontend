import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import WardenLayout from '../../components/layout/WardenLayout';
import {
  FaUsers,
  FaUserTie,
  FaFileAlt,
  FaCalendarAlt,
  FaGavel,
  FaChartLine,
  FaUserClock,
  FaHeartbeat,
  FaBell,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaSave,
  FaKey
} from 'react-icons/fa';

const WardenDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [stats, setStats] = useState({
    totalInmates: 0,
    totalStaff: 0,
    pendingReports: 0,
    pendingParoles: 0,
    pendingLeaves: 0,
    todaySchedule: 0,
    behaviorAlerts: 0,
    rehabilitationPrograms: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Staff creation state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffNotification, setStaffNotification] = useState(null);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    position: '',
    department: '',
    assignedBlock: '',
    experience: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('http://localhost:5000/api/warden/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Fetch recent activity
      const activityResponse = await fetch('http://localhost:5000/api/warden/dashboard/activity', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activity);
      }

      // Fetch alerts
      const alertsResponse = await fetch('http://localhost:5000/api/warden/dashboard/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend, onClick }) => (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">{trend.positive ? '↗' : '↘'}</span>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="text-2xl text-white" />
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ alert }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      alert.priority === 'high' ? 'border-red-500 bg-red-50' :
      alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
      'border-blue-500 bg-blue-50'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {alert.priority === 'high' ? (
            <FaExclamationTriangle className="text-red-500" />
          ) : alert.priority === 'medium' ? (
            <FaClock className="text-yellow-500" />
          ) : (
            <FaBell className="text-blue-500" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
        </div>
      </div>
    </div>
  );

  // Staff creation function
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(staffFormData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStaffNotification({
          type: 'success',
          message: `✅ Staff created! Password: ${data.staff.generatedPassword}`,
          email: staffFormData.email
        });

        // Reset form
        setStaffFormData({
          name: '',
          email: '',
          phone: '',
          employeeId: '',
          position: '',
          department: '',
          assignedBlock: '',
          experience: ''
        });
        setShowStaffModal(false);
        setTimeout(() => setStaffNotification(null), 10000);
      } else {
        setStaffNotification({
          type: 'error',
          message: `❌ ${data.msg || 'Failed to create staff'}`
        });
        setTimeout(() => setStaffNotification(null), 5000);
      }
    } catch (error) {
      setStaffNotification({
        type: 'error',
        message: '❌ Network error. Please try again.'
      });
      setTimeout(() => setStaffNotification(null), 5000);
    } finally {
      setStaffLoading(false);
    }
  };

  if (loading) {
    return (
      <WardenLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Warden Dashboard" subtitle="Monitor and manage your facility operations">
      <div className="space-y-6">

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaUsers}
            title="Total Inmates"
            value={stats.totalInmates}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend={{ positive: true, value: "+5 this week" }}
            onClick={() => window.location.href = '/warden/inmates'}
          />
          <StatCard
            icon={FaUserTie}
            title="Staff Members"
            value={stats.totalStaff}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={{ positive: true, value: "+2 new staff" }}
            onClick={() => window.location.href = '/warden/staff'}
          />
          <StatCard
            icon={FaFileAlt}
            title="Pending Reports"
            value={stats.pendingReports}
            color="bg-gradient-to-r from-yellow-500 to-yellow-600"
            trend={{ positive: false, value: "3 overdue" }}
            onClick={() => window.location.href = '/warden/reports'}
          />
          <StatCard
            icon={FaGavel}
            title="Parole Requests"
            value={stats.pendingParoles}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={{ positive: true, value: "2 approved today" }}
            onClick={() => window.location.href = '/warden/paroles'}
          />
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaUserClock}
            title="Leave Requests"
            value={stats.pendingLeaves}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            trend={{ positive: false, value: "5 pending" }}
            onClick={() => window.location.href = '/warden/leaves'}
          />
          <StatCard
            icon={FaCalendarAlt}
            title="Today's Schedule"
            value={stats.todaySchedule}
            color="bg-gradient-to-r from-teal-500 to-teal-600"
            trend={{ positive: true, value: "All on track" }}
            onClick={() => window.location.href = '/warden/schedule'}
          />
          <StatCard
            icon={FaChartLine}
            title="Behavior Alerts"
            value={stats.behaviorAlerts}
            color="bg-gradient-to-r from-red-500 to-red-600"
            trend={{ positive: false, value: "2 critical" }}
            onClick={() => window.location.href = '/warden/behavior'}
          />
          <StatCard
            icon={FaHeartbeat}
            title="Rehab Programs"
            value={stats.rehabilitationPrograms}
            color="bg-gradient-to-r from-pink-500 to-pink-600"
            trend={{ positive: true, value: "85% completion" }}
            onClick={() => window.location.href = '/warden/rehabilitation'}
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
                      activity.type === 'report' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'parole' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'behavior' ? 'bg-red-100 text-red-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'report' ? <FaFileAlt className="text-lg" /> :
                       activity.type === 'parole' ? <FaGavel className="text-lg" /> :
                       activity.type === 'behavior' ? <FaExclamationTriangle className="text-lg" /> :
                       <FaCheckCircle className="text-lg" />}
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

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => window.location.href = '/warden/inmates/add'}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-center transition-all duration-200 border border-blue-200 hover:border-blue-300"
            >
              <FaUsers className="text-3xl text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-blue-900">Add Inmate</p>
              <p className="text-xs text-blue-700 mt-1">Register new inmate</p>
            </button>
            <button
              onClick={() => setShowStaffModal(true)}
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-center transition-all duration-200 border border-green-200 hover:border-green-300"
            >
              <FaUserTie className="text-3xl text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-green-900">Add Staff</p>
              <p className="text-xs text-green-700 mt-1">Hire new staff member</p>
            </button>
            <button
              onClick={() => window.location.href = '/warden/reports/create'}
              className="group p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl text-center transition-all duration-200 border border-yellow-200 hover:border-yellow-300"
            >
              <FaFileAlt className="text-3xl text-yellow-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-yellow-900">Create Report</p>
              <p className="text-xs text-yellow-700 mt-1">Submit weekly report</p>
            </button>
            <button
              onClick={() => window.location.href = '/warden/schedule'}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-center transition-all duration-200 border border-purple-200 hover:border-purple-300"
            >
              <FaCalendarAlt className="text-3xl text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-purple-900">View Schedule</p>
              <p className="text-xs text-purple-700 mt-1">Daily activities</p>
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

      {/* Staff Notification */}
      {staffNotification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          staffNotification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-start">
            <span className="mr-2">
              {staffNotification.type === 'success' ? '✅' : '❌'}
            </span>
            <div className="flex-1">
              <p className="font-medium">{staffNotification.message}</p>
              {staffNotification.email && (
                <p className="text-sm mt-1">Email sent to: {staffNotification.email}</p>
              )}
            </div>
            <button
              onClick={() => setStaffNotification(null)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Staff Creation Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add New Staff Member</h3>
                <button
                  onClick={() => setShowStaffModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={staffFormData.name}
                    onChange={(e) => setStaffFormData({...staffFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData({...staffFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({...staffFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
                  <input
                    type="text"
                    value={staffFormData.employeeId}
                    onChange={(e) => setStaffFormData({...staffFormData, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter employee ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <select
                    value={staffFormData.position}
                    onChange={(e) => setStaffFormData({...staffFormData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select position</option>
                    <option value="Security Officer">Security Officer</option>
                    <option value="Correctional Officer">Correctional Officer</option>
                    <option value="Medical Officer">Medical Officer</option>
                    <option value="Rehabilitation Counselor">Rehabilitation Counselor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    value={staffFormData.department}
                    onChange={(e) => setStaffFormData({...staffFormData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Security">Security</option>
                    <option value="Medical">Medical</option>
                    <option value="Rehabilitation">Rehabilitation</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Block *</label>
                  <select
                    value={staffFormData.assignedBlock}
                    onChange={(e) => setStaffFormData({...staffFormData, assignedBlock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select block</option>
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Medical Wing">Medical Wing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
                <textarea
                  value={staffFormData.experience}
                  onChange={(e) => setStaffFormData({...staffFormData, experience: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe relevant experience"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Password Information</h4>
                <p className="text-sm text-blue-700">
                  An 8-digit password will be automatically generated and sent to the staff member's email.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffLoading}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {staffLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {staffLoading ? 'Creating...' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}
    </WardenLayout>
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

export default WardenDashboard;
