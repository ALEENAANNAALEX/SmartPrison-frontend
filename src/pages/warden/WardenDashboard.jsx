import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import WardenLayout from '../../components/layout/WardenLayout';
import {
  FaUsers,
  FaUserTie,
  FaFileAlt,
  FaGavel,
  FaCalendarAlt,
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
  const navigate = useNavigate();
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
  const [staffImage, setStaffImage] = useState(null);
  const [staffImagePreview, setStaffImagePreview] = useState(null);

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
    experience: '',
    shift: 'day'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token');

      const authHeaders = { 'Authorization': `Bearer ${token}` };

      // Stats
      try {
        const r = await fetch('http://localhost:5000/api/warden/dashboard/stats', { headers: authHeaders });
        if (r.ok) {
          const data = await r.json();
          setStats(data?.stats || stats);
        }
      } catch (e) {}

      // Activity
      try {
        const r = await fetch('http://localhost:5000/api/warden/dashboard/activity', { headers: authHeaders });
        if (r.ok) {
          const data = await r.json();
          setRecentActivity(Array.isArray(data?.activity) ? data.activity : recentActivity);
        }
      } catch (e) {}

      // Alerts
      try {
        const r = await fetch('http://localhost:5000/api/warden/dashboard/alerts', { headers: authHeaders });
        if (r.ok) {
          const data = await r.json();
          setAlerts(Array.isArray(data?.alerts) ? data.alerts : alerts);
        }
      } catch (e) {}

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend, onClick, loading: cardLoading = false }) => (
    <div 
      onClick={onClick}
      className={`${color} rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">
            {cardLoading ? '...' : value}
          </p>
          {trend && !cardLoading && (
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

  // Handle image selection
  const handleImageSelect = (e) => {
    console.log('Image selection triggered!', e.target.files);
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStaffNotification({
          type: 'error',
          message: '❌ Please select a valid image file'
        });
        setTimeout(() => setStaffNotification(null), 5000);
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setStaffNotification({
          type: 'error',
          message: '❌ Image size must be less than 5MB'
        });
        setTimeout(() => setStaffNotification(null), 5000);
        return;
      }
      
      setStaffImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setStaffImagePreview(e.target.result);
        console.log('Image preview created!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setStaffImage(null);
    setStaffImagePreview(null);
  };

  // Staff creation function
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add form fields
      Object.keys(staffFormData).forEach(key => {
        formData.append(key, staffFormData[key]);
      });
      
      // Add image if selected
      if (staffImage) {
        formData.append('staffImage', staffImage);
      }

      const response = await fetch('http://localhost:5000/api/warden/create-staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
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
          experience: '',
          shift: 'day'
        });
        setStaffImage(null);
        setStaffImagePreview(null);
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
            onClick={() => navigate('/warden/inmates')}
            loading={loading}
          />
          <StatCard
            icon={FaUserTie}
            title="Staff Members"
            value={stats.totalStaff}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend={{ positive: true, value: "+2 new staff" }}
            onClick={() => setShowStaffModal(true)}
            loading={loading}
          />
          <StatCard
            icon={FaFileAlt}
            title="Pending Reports"
            value={stats.pendingReports}
            color="bg-gradient-to-r from-yellow-500 to-yellow-600"
            trend={{ positive: false, value: "3 overdue" }}
            onClick={() => navigate('/warden/reports')}
            loading={loading}
          />
          <StatCard
            icon={FaGavel}
            title="Parole Requests"
            value={stats.pendingParoles}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            trend={{ positive: true, value: "2 approved today" }}
            onClick={() => navigate('/warden/paroles')}
            loading={loading}
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
            onClick={() => navigate('/warden/leaves')}
            loading={loading}
          />
          <StatCard
            icon={FaCalendarAlt}
            title="Today's Schedule"
            value={stats.todaySchedule}
            color="bg-gradient-to-r from-teal-500 to-teal-600"
            trend={{ positive: true, value: "All on track" }}
            onClick={() => navigate('/warden/schedule')}
            loading={loading}
          />
          <StatCard
            icon={FaChartLine}
            title="Behavior Alerts"
            value={stats.behaviorAlerts}
            color="bg-gradient-to-r from-red-500 to-red-600"
            trend={{ positive: false, value: "2 critical" }}
            onClick={() => navigate('/warden/behavior')}
            loading={loading}
          />
          <StatCard
            icon={FaHeartbeat}
            title="Rehab Programs"
            value={stats.rehabilitationPrograms}
            color="bg-gradient-to-r from-pink-500 to-pink-600"
            trend={{ positive: true, value: "85% completion" }}
            onClick={() => navigate('/warden/rehabilitation')}
            loading={loading}
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

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Today's Schedule</h3>
          <div className="space-y-4">
            {(Array.isArray(stats.todayScheduleList) ? stats.todayScheduleList : [
              { time: '09:00', activity: 'Morning briefing', location: 'Warden Office' },
              { time: '11:00', activity: 'Block inspection', location: 'Block A' },
              { time: '14:00', activity: 'Parole review meeting', location: 'Conference Room' },
              { time: '16:00', activity: 'Staff debrief', location: 'Operations' }
            ]).map((item, index) => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button
              onClick={() => navigate('/warden/inmates/add')}
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
              onClick={() => navigate('/warden/reports/create')}
              className="group p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl text-center transition-all duration-200 border border-yellow-200 hover:border-yellow-300"
            >
              <FaFileAlt className="text-3xl text-yellow-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-yellow-900">Create Report</p>
              <p className="text-xs text-yellow-700 mt-1">Submit weekly report</p>
            </button>
            <button
              onClick={() => navigate('/warden/schedule')}
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[98vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Add New Staff Member</h3>
                  <p className="text-indigo-100 mt-1">Fill in the details to create a new staff account</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowStaffModal(false)}
                    className="text-indigo-100 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                  >
                    ← Back to list
                  </button>
                  <button
                    onClick={() => setShowStaffModal(false)}
                    className="text-white hover:text-indigo-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 overflow-y-auto max-h-[calc(98vh-120px)]">
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <FaUserTie className="text-indigo-600" />
                    </div>
                    Personal Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={staffFormData.name}
                        onChange={(e) => setStaffFormData({...staffFormData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        placeholder="Enter 10-digit phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                      <div className="bg-gray-100 px-4 py-3 rounded-lg text-sm text-gray-600">
                        Employee ID will be auto-generated (e.g., S001) after creation
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Information Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <FaGavel className="text-green-600" />
                    </div>
                    Work Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                      <select
                        value={staffFormData.position}
                        onChange={(e) => setStaffFormData({...staffFormData, position: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Select position</option>
                        <option value="Security Officer">Security Officer</option>
                        <option value="Correctional Officer">Correctional Officer</option>
                        <option value="Medical Officer">Medical Officer</option>
                        <option value="Rehabilitation Counselor">Rehabilitation Counselor</option>
                        <option value="Administrative Staff">Administrative Staff</option>
                        <option value="Prison Control Room Officer">Prison Control Room Officer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                      <select
                        value={staffFormData.department}
                        onChange={(e) => setStaffFormData({...staffFormData, department: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Select block</option>
                        <option value="Block A">Block A</option>
                        <option value="Block B">Block B</option>
                        <option value="Block C">Block C</option>
                        <option value="Medical Wing">Medical Wing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shift *</label>
                      <select
                        value={staffFormData.shift}
                        onChange={(e) => setStaffFormData({...staffFormData, shift: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        required
                      >
                        <option value="day">Day Shift</option>
                        <option value="night">Night Shift</option>
                        <option value="rotating">Rotating Shift</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years) *</label>
                    <input
                      type="number"
                      value={staffFormData.experience}
                      onChange={(e) => setStaffFormData({...staffFormData, experience: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="Enter years of experience (e.g., 5)"
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                </div>

                {/* Profile Image Section - MADE MORE PROMINENT */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-purple-400 rounded-2xl p-8 shadow-2xl">
                  <h4 className="text-2xl font-bold text-purple-900 mb-8 flex items-center justify-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    📸 PROFILE IMAGE UPLOAD
                    <span className="ml-4 text-lg font-normal text-purple-700 bg-purple-200 px-4 py-2 rounded-full border-2 border-purple-300">(Optional)</span>
                  </h4>
                  
                  {/* Test Button */}
                  <div className="text-center mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Test button clicked!');
                        alert('Image section is working! Check console for details.');
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      🧪 TEST IMAGE SECTION
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Preview */}
                    <div className="flex flex-col items-center">
                      <h5 className="text-lg font-semibold text-gray-700 mb-4">Image Preview</h5>
                      {staffImagePreview ? (
                        <div className="relative">
                          <img
                            src={staffImagePreview}
                            alt="Profile preview"
                            className="w-40 h-40 object-cover rounded-2xl border-4 border-purple-200 shadow-xl"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 transition-colors shadow-lg font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-40 h-40 bg-gray-200 rounded-2xl flex items-center justify-center border-4 border-dashed border-gray-300">
                          <div className="text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-sm text-gray-500 font-medium">No image selected</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* File Input */}
                    <div className="flex flex-col">
                      <h5 className="text-xl font-bold text-purple-800 mb-6 text-center">UPLOAD IMAGE HERE</h5>
                      <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-purple-500 border-dashed rounded-3xl cursor-pointer bg-gradient-to-br from-white to-purple-50 hover:from-purple-50 hover:to-purple-100 transition-all duration-300 group shadow-2xl hover:shadow-3xl transform hover:scale-105">
                        <div className="flex flex-col items-center justify-center pt-8 pb-8">
                          <svg className="w-20 h-20 mb-6 text-purple-500 group-hover:text-purple-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-3 text-xl text-purple-700 group-hover:text-purple-900 font-bold">
                            <span className="text-2xl">📁</span> <span className="font-black">CLICK TO UPLOAD</span> <span className="text-2xl">📁</span>
                          </p>
                          <p className="text-lg text-purple-600 group-hover:text-purple-800 font-semibold mb-2">
                            or drag and drop your image here
                          </p>
                          <p className="text-base text-purple-500 font-medium">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Password Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaKey className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-900">Password Information</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        A secure password will be automatically generated and sent to the staff member's email address.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffLoading}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {staffLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Staff...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Create Staff Member
                    </>
                  )}
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
