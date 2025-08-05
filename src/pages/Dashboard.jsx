import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Bell,
  FileText,
  Shield,
  Users,
  Settings
} from 'lucide-react';
import emblem from '../assets/kerala-emblem.png';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
import { useNotification } from '../contexts/NotificationContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [showViewHistory, setShowViewHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: user?.user_metadata?.full_name || user?.name || 'ALEENA ANNA ALEX',
    email: user?.email || 'aleenaannaalex2026@mca.ajce.in',
    phone: user?.phone || '',
    address: user?.address || '',
    profilePhoto: user?.user_metadata?.avatar_url || user?.profilePhoto || 'https://lh3.googleusercontent.com/a/ACg8ocLwDeAicKdSKvQE1D2b0qOclgCrvwj2khm_H6UPPp6wjahMEdlx=s96-c',
    // Additional fields from Supabase
    fullName: user?.user_metadata?.full_name || user?.name || 'ALEENA ANNA ALEX',
    dateOfBirth: user?.user_metadata?.dateOfBirth || '1995-06-15',
    gender: user?.user_metadata?.gender || 'female',
    nationality: user?.user_metadata?.nationality || 'Indian',
    maritalStatus: user?.user_metadata?.maritalStatus || 'single'
  });

  // Use navigation guard to prevent going back to auth pages
  useNavigationGuard();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    console.log('Dashboard useEffect - User data:', user);
    console.log('Dashboard useEffect - User role:', user?.role);
    if (user && user.role === 'admin') {
      console.log('Redirecting admin user to /admin');
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // Function to update profile data
  const updateProfile = (newProfileData) => {
    setUserProfile(prev => ({ ...prev, ...newProfileData }));
  };



  const handleLogout = async () => {
    const result = await logout();
    if (result.success || !result.error) {
      navigate('/login');
    }
    navigate('/');
  };

  const upcomingVisits = [
    {
      id: 1,
      inmateName: "John Doe",
      date: "2024-01-25",
      time: "10:00 AM",
      status: "Confirmed",
      location: "Block A - Room 3"
    },
    {
      id: 2,
      inmateName: "Jane Smith",
      date: "2024-01-28",
      time: "2:00 PM",
      status: "Pending",
      location: "Block B - Room 1"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Visit Request Submitted",
      inmate: "John Doe",
      date: "2024-01-20",
      status: "Approved"
    },
    {
      id: 2,
      action: "Visit Completed",
      inmate: "Jane Smith",
      date: "2024-01-18",
      status: "Completed"
    },
    {
      id: 3,
      action: "Profile Updated",
      inmate: "-",
      date: "2024-01-15",
      status: "Success"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Header - Same as Home page */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-[9999] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={emblem} alt="Kerala Emblem" className="h-10 w-10" />
              <span className="text-xl font-bold text-black">Smart Prison</span>
            </div>

            {/* Right side - User info and logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                  {userProfile.profilePhoto ? (
                    <img src={userProfile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
                <span className="text-gray-700 font-medium">Welcome, {userProfile.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium border border-gray-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Section - Home page style */}
      <section className="pt-16 min-h-screen flex flex-col relative overflow-hidden">
        {/* Background with overlay - Same as home page */}
        <div className="absolute inset-0 bg-gray-800"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-black/5 to-gray-800/15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5"></div>

        {/* Prison-themed architectural overlay */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="prison-bars" width="8" height="100" patternUnits="userSpaceOnUse">
                <rect x="3" y="0" width="2" height="100" fill="currentColor" opacity="0.3"/>
              </pattern>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            <rect width="100" height="100" fill="url(#prison-bars)" className="animate-pulse" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-6 shadow-lg border border-white/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              User Dashboard
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Welcome back! Manage your prison visits and stay connected with your loved ones through our secure platform.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Last login: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Dashboard Stats Cards - Home page style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Total Visits Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-600 rounded-lg shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">12</p>
                  <p className="text-blue-600 text-sm font-medium">+2 this month</p>
                </div>
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">Total Visits</h3>
              <p className="text-gray-600 text-sm mt-1">Completed visits this year</p>
            </div>

            {/* Pending Requests Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-600 rounded-lg shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">2</p>
                  <p className="text-yellow-600 text-sm font-medium">Awaiting approval</p>
                </div>
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">Pending Requests</h3>
              <p className="text-gray-600 text-sm mt-1">Visit requests under review</p>
            </div>

            {/* Active Inmates Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-600 rounded-lg shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">3</p>
                  <p className="text-green-600 text-sm font-medium">Active connections</p>
                </div>
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">Active Inmates</h3>
              <p className="text-gray-600 text-sm mt-1">People you can visit</p>
            </div>
          </div>

          {/* Main Content Grid - Home page style */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Visits - Home page style */}
            <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-600 rounded-lg shadow-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Upcoming Visits</h3>
                </div>
                <span className="text-purple-600 text-sm font-medium">{upcomingVisits.length} scheduled</span>
              </div>

              <div className="space-y-4">
                {upcomingVisits.map((visit, index) => (
                  <div key={visit.id} className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {visit.inmateName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{visit.inmateName}</p>
                          <div className="flex items-center space-x-4 text-gray-600 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{visit.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{visit.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500 text-sm mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>{visit.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          visit.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity - Home page style */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-md">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                      } shadow-sm`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium text-sm group-hover:text-blue-600 transition-colors">
                        {activity.action}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{activity.date}</p>
                      {activity.inmate && (
                        <p className="text-gray-400 text-xs">Related to: {activity.inmate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-gray-700 hover:text-black text-sm font-medium transition-colors duration-200">
                  View All Activity →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <button
              onClick={() => setShowScheduleVisit(true)}
              className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="p-3 bg-blue-600 rounded-lg shadow-md mx-auto w-fit mb-4 group-hover:bg-blue-700 transition-colors">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Schedule Visit</h3>
              <p className="text-gray-600 text-sm">Book a new visit appointment</p>
            </button>

            <button
              onClick={() => setShowViewHistory(true)}
              className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="p-3 bg-green-600 rounded-lg shadow-md mx-auto w-fit mb-4 group-hover:bg-green-700 transition-colors">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">View History</h3>
              <p className="text-gray-600 text-sm">Check past visit records</p>
            </button>

            <button
              onClick={() => setShowEditProfile(true)}
              className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="p-3 bg-purple-600 rounded-lg shadow-md mx-auto w-fit mb-4 group-hover:bg-purple-700 transition-colors">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Edit Profile</h3>
              <p className="text-gray-600 text-sm">Update your profile and photo</p>
            </button>

            <button
              onClick={() => setShowResetPassword(true)}
              className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="p-3 bg-red-600 rounded-lg shadow-md mx-auto w-fit mb-4 group-hover:bg-red-700 transition-colors">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Reset Password</h3>
              <p className="text-gray-600 text-sm">Change your account password</p>
            </button>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          userProfile={userProfile}
          updateProfile={updateProfile}
          onClose={() => setShowEditProfile(false)}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <ResetPasswordModal
          onClose={() => setShowResetPassword(false)}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}

      {/* Schedule Visit Modal */}
      {showScheduleVisit && (
        <ScheduleVisitModal
          onClose={() => setShowScheduleVisit(false)}
        />
      )}

      {/* View History Modal */}
      {showViewHistory && (
        <ViewHistoryModal
          onClose={() => setShowViewHistory(false)}
        />
      )}
    </div>
  );
}

// Edit Profile Modal Component
function EditProfileModal({ userProfile, updateProfile, onClose, showSuccess, showError }) {
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    address: userProfile.address,
    profilePhoto: null,
    // Additional fields
    fullName: userProfile.fullName,
    dateOfBirth: userProfile.dateOfBirth,
    gender: userProfile.gender,
    nationality: userProfile.nationality,
    maritalStatus: userProfile.maritalStatus
  });
  const [photoPreview, setPhotoPreview] = useState(userProfile.profilePhoto);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare updated profile data
      const updatedProfile = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        profilePhoto: photoPreview, // Use the preview URL
        // Additional fields
        fullName: formData.fullName || formData.name,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        maritalStatus: formData.maritalStatus
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the profile immediately in the dashboard
      updateProfile(updatedProfile);

      showSuccess('Profile updated successfully!', 'Profile Updated');
      onClose();
    } catch (error) {
      showError('Error updating profile. Please try again.', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto mb-4">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <User className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  📷
                </label>
              </div>
              <p className="text-sm text-gray-600">Click camera icon to change photo</p>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Enter your address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Indian"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Schedule Visit Modal Component
function ScheduleVisitModal({ onClose }) {
  const [formData, setFormData] = useState({
    inmateName: '',
    inmateId: '',
    visitDate: '',
    visitTime: '',
    visitType: 'general',
    purpose: '',
    relationship: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Visit scheduled successfully! You will receive a confirmation email.');
      onClose();
    } catch (error) {
      alert('Error scheduling visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Schedule Visit</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inmate Name</label>
              <input
                type="text"
                value={formData.inmateName}
                onChange={(e) => setFormData({ ...formData, inmateName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter inmate's full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inmate ID</label>
              <input
                type="text"
                value={formData.inmateId}
                onChange={(e) => setFormData({ ...formData, inmateId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter inmate ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select relationship</option>
                <option value="family">Family Member</option>
                <option value="friend">Friend</option>
                <option value="lawyer">Legal Representative</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visit Time</label>
              <select
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select time slot</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visit Type</label>
              <select
                value={formData.visitType}
                onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General Visit</option>
                <option value="legal">Legal Visit</option>
                <option value="medical">Medical Visit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Brief description of visit purpose"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule Visit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// View History Modal Component
function ViewHistoryModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('completed');

  const visitHistory = {
    completed: [
      {
        id: 1,
        inmateName: 'John Smith',
        date: '2024-01-15',
        time: '10:00 AM',
        duration: '30 minutes',
        status: 'Completed',
        type: 'General Visit'
      },
      {
        id: 2,
        inmateName: 'Michael Johnson',
        date: '2024-01-10',
        time: '02:00 PM',
        duration: '45 minutes',
        status: 'Completed',
        type: 'Legal Visit'
      },
      {
        id: 3,
        inmateName: 'John Smith',
        date: '2024-01-05',
        time: '11:00 AM',
        duration: '30 minutes',
        status: 'Completed',
        type: 'General Visit'
      }
    ],
    cancelled: [
      {
        id: 4,
        inmateName: 'Robert Brown',
        date: '2024-01-12',
        time: '03:00 PM',
        status: 'Cancelled',
        reason: 'Inmate unavailable',
        type: 'General Visit'
      }
    ],
    pending: [
      {
        id: 5,
        inmateName: 'David Wilson',
        date: '2024-01-28',
        time: '09:00 AM',
        status: 'Pending Approval',
        type: 'General Visit'
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Visit History</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'completed', label: 'Completed', count: visitHistory.completed.length },
              { key: 'pending', label: 'Pending', count: visitHistory.pending.length },
              { key: 'cancelled', label: 'Cancelled', count: visitHistory.cancelled.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Visit List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {visitHistory[activeTab].map((visit) => (
              <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{visit.inmateName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    visit.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : visit.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {visit.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Date:</span>
                    <br />
                    {new Date(visit.date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>
                    <br />
                    {visit.time}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <br />
                    {visit.type}
                  </div>
                  {visit.duration && (
                    <div>
                      <span className="font-medium">Duration:</span>
                      <br />
                      {visit.duration}
                    </div>
                  )}
                  {visit.reason && (
                    <div className="col-span-2">
                      <span className="font-medium">Reason:</span>
                      <br />
                      {visit.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {visitHistory[activeTab].length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No {activeTab} visits found</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reset Password Modal Component
function ResetPasswordModal({ onClose, showSuccess, showError }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePassword = (password) => {
    const hasAlphabet = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && hasAlphabet && hasNumber && hasSymbol;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'Password must be 8+ characters with letters, numbers, and symbols';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Simulate API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1500));

      showSuccess('Password updated successfully!', 'Password Changed');
      onClose();
    } catch (error) {
      showError('Error updating password. Please try again.', 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.currentPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter current password"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.newPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
