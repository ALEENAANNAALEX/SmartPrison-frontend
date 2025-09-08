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
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import emblem from '../assets/kerala-emblem.png';
import { useAuth } from '../contexts/AuthContext';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
import { useNotification } from '../contexts/NotificationContext';
import { supabase, validateSession } from '../lib/supabase';
import { useFormValidation } from '../hooks/useFormValidation';
import ValidatedInput, { ValidatedSelect, ValidatedTextarea } from '../components/ValidatedInput';
import {
  validateName,
  validateEmail,
  validateUserPhone,
  validateUserAddress,
  validatePassword,
  validateConfirmPassword,
  validateInmateId,
  validateVisitDate,
  validateVisitTime,
  validateRelationship,
  validatePurpose,
  getMinDateForVisit,
  getMaxDateForVisit
} from '../utils/validation';

export default function Dashboard() {
  // Visit history state for dashboard and modal
  const [visitHistory, setVisitHistory] = useState({ completed: [], cancelled: [], pending: [] });

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const base = 'http://localhost:5000';
        // Fetch cancelled and rejected separately then merge into one Cancelled bucket for UI
        const [pendingRes, completedRes, cancelledRes, rejectedRes] = await Promise.all([
          fetch(`${base}/api/visits/mine?status=pending`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/visits/mine?status=completed`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/visits/mine?status=cancelled`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/visits/mine?status=rejected`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const [pending, completed, cancelled, rejected] = await Promise.all([
          pendingRes.json(), completedRes.json(), cancelledRes.json(), rejectedRes.json()
        ]);
        const mapVisit = (v) => ({
          id: v._id,
          inmateName: v.prisoner ? `${v.prisoner.firstName} ${v.prisoner.lastName}` : '-',
          date: new Date(v.visitDate).toISOString().slice(0,10),
          time: v.visitTime,
          status: v.status,
          type: v.purpose || v.relationship || 'Visit'
        });
        // Merge cancelled + rejected into one list for the Cancelled tab
        const cancelledMerged = [
          ...((cancelled.visits || []).map(mapVisit)),
          ...((rejected.visits || []).map(mapVisit))
        ];

        setVisitHistory({
          completed: (completed.visits || []).map(mapVisit),
          cancelled: cancelledMerged,
          pending: (pending.visits || []).map(mapVisit)
        });
      } catch (e) {
        // Keep defaults if API fails
      }
    };
    loadHistory();
  }, []);
  const navigate = useNavigate();
  const { user, logout, fetchFreshUserData } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }
  }, [user, navigate]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showScheduleVisit, setShowScheduleVisit] = useState(false);
  const [showViewHistory, setShowViewHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    const profilePicture = user?.user_metadata?.avatar_url || user?.profilePicture || user?.profilePhoto;
    const profilePhotoUrl = profilePicture && !profilePicture.startsWith('http') 
      ? `http://localhost:5000${profilePicture}` 
      : profilePicture;
    
    return {
      name: user?.user_metadata?.full_name || user?.name || 'User',
      email: user?.email || '',
      phone: user?.phoneNumber || user?.phone || '',
      address: user?.address || '',
      profilePhoto: profilePhotoUrl || 'https://lh3.googleusercontent.com/a/ACg8ocLwDeAicKdSKvQE1D2b0qOclgCrvwj2khm_H6UPPp6wjahMEdlx=s96-c',
      // Additional fields from Supabase
      fullName: user?.user_metadata?.full_name || user?.name || 'User'
    };
  });

  // Update userProfile when user context changes (after fresh data fetch)
  useEffect(() => {
    if (user) {
      console.log('🔄 Updating userProfile from user context:', {
        name: user.name,
        profilePicture: user.profilePicture,
        phone: user.phoneNumber
      });
      
      const profilePicture = user?.user_metadata?.avatar_url || user?.profilePicture || user?.profilePhoto;
      const profilePhotoUrl = profilePicture && !profilePicture.startsWith('http') 
        ? `http://localhost:5000${profilePicture}` 
        : profilePicture;
      
      setUserProfile(prev => ({
        ...prev,
        name: user?.user_metadata?.full_name || user?.name || prev.name,
        email: user?.email || prev.email,
        phone: user?.phoneNumber || user?.phone || prev.phone,
        address: user?.address || prev.address,
        profilePhoto: profilePhotoUrl || prev.profilePhoto,
        fullName: user?.user_metadata?.full_name || user?.name || prev.fullName
      }));
    }
  }, [user]);

  // Debug profile photo changes
  useEffect(() => {
    console.log('📸 Profile photo changed:', userProfile.profilePhoto);
  }, [userProfile.profilePhoto]);

  // Use navigation guard to prevent going back to auth pages
  useNavigationGuard();

  // Redirect admin users to admin dashboard and validate session
  useEffect(() => {
    console.log('Dashboard useEffect - User data:', user);
    console.log('Dashboard useEffect - User role:', user?.role);
    
    if (user && user.role === 'admin') {
      console.log('Redirecting admin user to /admin');
      navigate('/admin', { replace: true });
    }

    // Validate Supabase session on component mount (only for Supabase users)
    const checkSession = async () => {
      try {
        // Only validate session for Supabase users (Google OAuth users)
        if (user && supabase && (user.supabaseId || user.authProvider === 'google')) {
          await validateSession();
        }
      } catch (error) {
        // Silently handle session validation errors
        // Don't show error immediately, let user try actions first
      }
    };

    // Fetch fresh user data from database on component mount
    const loadFreshUserData = async () => {
      try {
        if (user && !user.supabaseId) { // Only for MongoDB users
          console.log('🔄 Loading fresh user data for MongoDB user...');
          const freshUser = await fetchFreshUserData();
          if (freshUser) {
            console.log('✅ Fresh user data loaded successfully');
          }
        }
      } catch (error) {
        console.warn('Failed to load fresh user data:', error.message);
      }
    };

    checkSession();
    loadFreshUserData();
  }, [user, navigate]);

  // Function to update profile data and global user context
  const { refreshUser } = useAuth();
  const updateProfile = async (newProfileData) => {
    setUserProfile(prev => ({ ...prev, ...newProfileData }));
    // Refresh global user context from backend after update
    try {
      console.log('🔄 Refreshing user context after profile update...');
      const freshUser = await fetchFreshUserData();
      if (freshUser) {
        console.log('✅ User context refreshed with latest data');
        // Update local profile state with fresh data
        setUserProfile(prev => ({
          ...prev,
          name: freshUser.name || prev.name,
          email: freshUser.email || prev.email,
          phone: freshUser.phoneNumber || prev.phone,
          address: freshUser.address || prev.address,
          profilePhoto: freshUser.profilePicture || prev.profilePhoto
        }));
        console.log('📸 Updated profile photo URL:', freshUser.profilePicture);
      }
    } catch (error) {
      console.warn('Failed to refresh user context:', error);
      // Fallback to old method
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
    }
  };



  const handleLogout = async () => {
    const result = await logout();
    if (result.success || !result.error) {
      navigate('/login');
    }
    navigate('/');
  };

  const [upcomingVisits, setUpcomingVisits] = useState([]);
  useEffect(() => {
    const loadUpcoming = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const base = 'http://localhost:5000';
        const res = await fetch(`${base}/api/visits/upcoming`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        console.log('Upcoming visits API response:', data);
        if (res.ok && data?.visits) {
          const mapped = data.visits.map(v => ({
            id: v._id,
            inmateName: v.prisoner ? `${v.prisoner.firstName} ${v.prisoner.lastName}` : '-',
            date: new Date(v.visitDate).toISOString().slice(0,10),
            time: v.visitTime,
            status: v.status || 'Approved',
            location: '-'
          }));
          setUpcomingVisits(mapped);
        } else {
          console.warn('No upcoming visits found or API error:', data);
        }
      } catch (e) {
        console.error('Error loading upcoming visits:', e);
      }
    };
    loadUpcoming();
  }, []);


  // Don't render dashboard if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
                    <img 
                      src={userProfile.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('❌ Profile image failed to load:', userProfile.profilePhoto);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('✅ Profile image loaded successfully:', userProfile.profilePhoto);
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center bg-gray-300" style={{ display: userProfile.profilePhoto ? 'none' : 'flex' }}>
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Total Visits Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-600 rounded-lg shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{upcomingVisits.length}</p>
                  <p className="text-blue-600 text-sm font-medium">+{upcomingVisits.filter(v => v.date && new Date(v.date).getMonth() === new Date().getMonth()).length} this month</p>
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
                  <p className="text-3xl font-bold text-gray-900">{visitHistory && visitHistory.pending ? visitHistory.pending.length : 0}</p>
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
                  <p className="text-3xl font-bold text-gray-900">{
                    Array.from(new Set(
                      upcomingVisits
                        .filter(v => ['approved','confirmed'].includes((v.status || '').toLowerCase()))
                        .map(v => v.inmateName)
                    )).length
                  }</p>
                  <p className="text-green-600 text-sm font-medium">Active connections</p>
                </div>
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">Active Inmates</h3>
              <p className="text-gray-600 text-sm mt-1">People you  visited</p>
            </div>
          </div>

          {/* Main Content Grid - Home page style */}
          <div className="grid grid-cols-1 gap-8">
            {/* Upcoming Visits - Home page style */}
            <div className="w-full bg-gradient-to-br from-purple-500/10 via-white/95 to-blue-500/10 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
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
                {upcomingVisits.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p>No upcoming visits found.</p>
                    <p className="text-xs mt-2">If you have scheduled visits, make sure they are approved and for a future date.</p>
                  </div>
                ) : (
                  upcomingVisits.map((visit, index) => (
                    <div key={visit.id} className="group bg-gradient-to-r from-purple-100 via-white to-blue-100 border border-gray-100 rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-between">
                      <div className="flex items-center gap-6 w-full">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {visit.inmateName.charAt(0)}
                        </div>
                        <div className="flex-1 flex flex-row items-center gap-8">
                          <span className="font-semibold text-gray-900 text-lg">{visit.inmateName}</span>
                          <span className="flex items-center gap-2 text-gray-600 text-sm"><Calendar className="w-4 h-4" />{visit.date}</span>
                          <span className="flex items-center gap-2 text-gray-600 text-sm"><Clock className="w-4 h-4" />{visit.time}</span>
                          <span className="text-gray-500 text-sm">{visit.location}</span>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          visit.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity - Home page style */}
            {/* Removed empty block for better layout */}
          </div>

          {/* Quick Actions Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => setShowScheduleVisit(true)}
              className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200 text-center group"
            >
              <div className="p-3 bg-blue-600 rounded-lg shadow-md mx-auto w-fit mb-4 group-hover:bg-blue-700 transition-colors">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Schedule Visit</h3>
              <p className="text-gray-600 text-sm">Book a new visit appointment</p>
            </button>

            <button
              onClick={() => setShowViewHistory(true)}
              className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200 text-center group"
            >
              <div className="p-3 bg-green-600 rounded-lg shadow-md mx-auto w-fit mb-4 group-hover:bg-green-700 transition-colors">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">View History</h3>
              <p className="text-gray-600 text-sm">Check past visit records</p>
            </button>

            <button
              onClick={() => setShowEditProfile(true)}
              className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200 text-center group"
            >
              <div className="p-3 bg-purple-600 rounded-lg shadow-md mx-auto w-fit mb-4 group-hover:bg-purple-700 transition-colors">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg mb-2">Edit Profile</h3>
              <p className="text-gray-600 text-sm">Update your profile and photo</p>
            </button>

            <button
              onClick={() => setShowResetPassword(true)}
              className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200 text-center group"
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
          setUserProfile={setUserProfile}
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
function EditProfileModal({ userProfile, updateProfile, setUserProfile, onClose, showSuccess, showError }) {
  const { user } = useAuth();

  // Define validation rules for the profile form
  const validationRules = {
    name: validateName,
    email: validateEmail,
    phone: validateUserPhone,
    address: validateUserAddress
  };

  // Initialize form validation
  const {
    formData,
    errors,
    touched,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    getFieldError,
    hasFieldError,
    isFieldValid
  } = useFormValidation({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone || '',
    address: userProfile.address || ''
  }, validationRules);

  const [photoPreview, setPhotoPreview] = useState(userProfile.profilePhoto);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, or GIF)', 'Invalid File Type');
        return;
      }

      if (file.size > maxSize) {
        showError('Image size must be less than 5MB', 'File Too Large');
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const isFormValid = await validateAllFields();
    if (!isFormValid) {
      setLoading(false);
      showError('Please fix all validation errors before submitting', 'Validation Error');
      return;
    }

    try {
      let avatarUrl = userProfile.profilePhoto;
      let useSupabase = false;
      let currentUser = user;

      // Check if user is authenticated via Supabase (Google OAuth)
      console.log('User object:', user);
      console.log('User has supabaseId:', !!user?.supabaseId);
      console.log('User authProvider:', user?.authProvider);
      console.log('Supabase available:', !!supabase);
      
      // Force all users (including Google users) to use MongoDB for profile updates
      // This ensures data persistence across login sessions
      console.log('Forcing MongoDB profile update for all users to ensure persistence');
      useSupabase = false;

      // Upload new profile photo if selected (using MongoDB backend for all users)
      if (profilePhoto) {
        // For MongoDB users, we'll handle photo upload via the backend API
        console.log('Uploading photo via MongoDB API');
        
        const formDataForUpload = new FormData();
        formDataForUpload.append('profilePicture', profilePhoto);
        
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        try {
          const uploadResponse = await fetch('http://localhost:5000/api/user/profile/picture', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formDataForUpload
          });

          if (!uploadResponse.ok) {
            let errorMessage = 'Failed to upload profile picture';
            try {
              const errorData = await uploadResponse.json();
              errorMessage = errorData.msg || errorData.message || errorMessage;
            } catch (parseError) {
              errorMessage = `Upload error: ${uploadResponse.status} ${uploadResponse.statusText}`;
            }
            throw new Error(errorMessage);
          }

          const uploadData = await uploadResponse.json();
          avatarUrl = `http://localhost:5000${uploadData.profilePicture}`;
          console.log('Photo uploaded successfully:', avatarUrl);
          
          // Immediately update the profile photo in the form preview
          setPhotoPreview(avatarUrl);
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          showError('Failed to upload profile picture. Continuing with profile update.', 'Upload Warning');
        }
      }

      // Update profile via MongoDB API (for all users including Google users)
      const token = sessionStorage.getItem('token');
      console.log('MongoDB update - Token available:', !!token);
      console.log('MongoDB update - User ID:', user?.id);
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const updateData = {
        name: formData.name,
        phoneNumber: formData.phone,
        address: formData.address
      };
      console.log('Sending profile update data:', updateData);

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.msg || errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON (like HTML error page), use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('MongoDB profile update successful:', data);
      
      // Update the user context with the new data
      if (data.user) {
        console.log('Updating user context with:', data.user);
        // Use the profile picture from the backend response if available
        if (data.user.profilePicture && !avatarUrl) {
          // Check if the URL already includes the domain
          avatarUrl = data.user.profilePicture.startsWith('http') 
            ? data.user.profilePicture 
            : `http://localhost:5000${data.user.profilePicture}`;
          console.log('Using existing profile picture from backend:', avatarUrl);
        }
      }

      // Update local profile state immediately
      const updatedProfileData = {
        ...formData,
        // Use new avatar URL if uploaded, otherwise keep existing profile photo
        profilePhoto: avatarUrl || userProfile.profilePhoto,
      };
      
      updateProfile(updatedProfileData);

      console.log('Profile update completed with avatar URL:', avatarUrl);
      console.log('Final profile photo URL:', updatedProfileData.profilePhoto);
      
      // Force immediate UI update
      setUserProfile(prev => {
        const newProfile = {
          ...prev,
          ...updatedProfileData
        };
        console.log('Setting userProfile to:', newProfile);
        return newProfile;
      });

      showSuccess('Profile updated successfully!', 'Profile Updated');
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Handle specific authentication errors
      if (error.message.includes('session') || 
          error.message.includes('Auth session missing') ||
          error.message.includes('No active session') ||
          error.message.includes('User not found')) {
        showError('Your session has expired. Please log out and log in again to continue.', 'Session Expired');
      } else if (error.message.includes('Authentication token not found')) {
        showError('Authentication token missing. Please log out and log in again.', 'Authentication Error');
      } else if (error.message.includes('Token is not valid')) {
        showError('Your session is invalid. Please log out and log in again.', 'Invalid Session');
      } else if (error.message.includes('Supabase is not configured')) {
        showError('Application configuration error. Please contact support.', 'Configuration Error');
      } else if (error.message.includes('Server error')) {
        showError('Server error occurred. Please try again later.', 'Server Error');
      } else {
        showError(error.message || 'Error updating profile. Please try again.', 'Update Failed');
      }
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
            <ValidatedInput
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('name')}
              isValid={isFieldValid('name')}
              required
              placeholder="Enter your full name"
            />

            <ValidatedInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('email')}
              isValid={isFieldValid('email')}
              required
              disabled={true}
              placeholder="Email cannot be changed"
              helperText="Email address cannot be modified for security reasons"
            />

            <ValidatedInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(name, value) => {
                // Filter out alphabets and unwanted special characters before setting value
                const filteredValue = value.replace(/[^0-9\s\-\(\)\+]/g, '');
                handleFieldChange(name, filteredValue);
              }}
              onBlur={handleFieldBlur}
              error={getFieldError('phone')}
              isValid={isFieldValid('phone')}
              placeholder="Enter your phone number"
            />

            <ValidatedTextarea
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('address')}
              isValid={isFieldValid('address')}
              rows={3}
              placeholder="Enter your address"
              helperText="Optional: Your residential address"
            />



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
                disabled={loading || !isValid}
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
  const { showSuccess, showError } = useNotification();
  const API_BASE = 'http://localhost:5000';

  // Optional list of valid inmate names (may be unavailable for visitors)
  const [validInmateNames, setValidInmateNames] = useState([]);
  const [inmateNameError, setInmateNameError] = useState('');
  // relationship removed
  // ...existing code...

  useEffect(() => {
    // Prefill inmate name and relationship if the current user is listed
    // as an emergency contact for any prisoner
    const prefillFromLinkedInmates = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return; // not logged in; skip prefill
        const res = await fetch(`${API_BASE}/api/visits/linked-inmates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401 || res.status === 403) {
          // Not authorized for some reason; skip silently
          return;
        }
        let data = null;
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try { data = await res.json(); } catch (_) { data = null; }
        }
        if (res.ok && data?.success && Array.isArray(data.inmates)) {
          if (data.inmates.length === 1) {
            const only = data.inmates[0];
            if (only?.fullName) handleFieldChange('inmateName', only.fullName);
          }
        }
      } catch (e) {
        // Ignore errors but do not crash UI
        // console.error('Prefill linked inmates failed', e);
      }
    };

    prefillFromLinkedInmates();

    // Note: fetching the full inmate list is restricted to wardens.
    // For visitors we skip this to avoid 401 errors; validation will not rely on the list.
  }, []);

  // Define validation rules for visit scheduling
  const validationRules = {
    inmateName: validateName,
    visitDate: validateVisitDate,
    visitTime: validateVisitTime,
    purpose: validatePurpose
  };

  // Initialize form validation
  const {
    formData,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    getFieldError,
    isFieldValid
  } = useFormValidation({
    inmateName: '',
    visitDate: '',
    visitTime: '',
    visitType: 'general',
    purpose: ''
  }, validationRules);

  // Real-time inmate name validation
  const handleInmateNameChange = (name, value) => {
    handleFieldChange(name, value);
    if (!value.trim()) {
      setInmateNameError('');
      return;
    }
    // If we don't have a whitelist of names (visitor), do not block typing
    if (!Array.isArray(validInmateNames) || validInmateNames.length === 0) {
      setInmateNameError('');
      return;
    }
    if (!validInmateNames.some(n => n.trim().toLowerCase() === value.trim().toLowerCase())) {
      setInmateNameError('No inmate found with this name');
    } else {
      setInmateNameError('');
    }
  };

  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([
    { slot: '09:00', remaining: 10 },
    { slot: '10:00', remaining: 10 },
    { slot: '11:00', remaining: 10 },
    { slot: '14:00', remaining: 10 },
    { slot: '15:00', remaining: 10 },
    { slot: '16:00', remaining: 10 },
  ]);

  // Fetch availability when date changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.visitDate) return;
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/visits/availability?date=${encodeURIComponent(formData.visitDate)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data?.slots) {
          setAvailableSlots(data.slots.filter(s => s.remaining > 0));
          // Reset selected time if it’s no longer available
          if (formData.visitTime && !data.slots.some(s => s.slot === formData.visitTime && s.remaining > 0)) {
            handleFieldChange('visitTime', '');
          }
        }
      } catch (e) {
        // Keep defaults if API fails
      }
    };
    fetchAvailability();
  }, [formData.visitDate]);

  // relationship fully removed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const isFormValid = await validateAllFields();
    if (!isFormValid) {
      setLoading(false);
      showError('Please fix all validation errors before submitting', 'Validation Error');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inmateName: formData.inmateName,
          visitDate: formData.visitDate,
          visitTime: formData.visitTime,
          purpose: formData.purpose
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.msg || 'Failed to schedule visit');
      }

      showSuccess('Visit scheduled successfully! You will receive a confirmation email.', 'Visit Scheduled');
      if (typeof fetchRecentActivity === 'function') {
        await fetchRecentActivity();
      }
      onClose();
    } catch (error) {
      showError(error.message || 'Error scheduling visit. Please try again.', 'Scheduling Failed');
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
            <ValidatedInput
              label="Inmate Name"
              name="inmateName"
              type="text"
              value={formData.inmateName}
              onChange={handleInmateNameChange}
              onBlur={handleFieldBlur}
              error={getFieldError('inmateName')}
              isValid={isFieldValid('inmateName')}
              required
              placeholder="Enter inmate's full name"
              helperText="Full name of the inmate you wish to visit"
              readOnly={true}
              disabled={true}
            />

            {/* Inmate ID removed as per requirements */}


            <ValidatedInput
              label="Visit Date"
              name="visitDate"
              type="date"
              value={formData.visitDate}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('visitDate')}
              isValid={isFieldValid('visitDate')}
              required
              min={getMinDateForVisit()}
              max={getMaxDateForVisit()}
              helperText="Select a date within the  1 months"
            />

            <ValidatedSelect
              label="Visit Time"
              name="visitTime"
              value={formData.visitTime}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('visitTime')}
              isValid={isFieldValid('visitTime')}
              required
              options={availableSlots.map(s => ({ value: s.slot, label: `${s.slot} (${s.remaining} left)` }))}
              placeholder="Select time slot"
              helperText="Only slots with remaining capacity are shown"
            />

            <ValidatedSelect
              label="Visit Type"
              name="visitType"
              value={formData.visitType}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              options={[
                { value: 'general', label: 'General Visit' },
                { value: 'legal', label: 'Legal Visit' },
                { value: 'medical', label: 'Medical Visit' }
              ]}
              helperText="Select the type of visit"
            />

            <ValidatedTextarea
              label="Purpose of Visit"
              name="purpose"
              value={formData.purpose}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('purpose')}
              isValid={isFieldValid('purpose')}
              required
              rows={3}
              placeholder="Brief description of visit purpose"
              helperText="Minimum 5 characters required"
            />

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

  const [visitHistory, setVisitHistory] = useState({ completed: [], cancelled: [], pending: [] });

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const base = 'http://localhost:5000';
        const [pendingRes, completedRes, cancelledRes, rejectedRes] = await Promise.all([
          fetch(`${base}/api/visits/mine?status=pending`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/visits/mine?status=completed`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/visits/mine?status=cancelled`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${base}/api/visits/mine?status=rejected`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const [pending, completed, cancelled, rejected] = await Promise.all([
          pendingRes.json(), completedRes.json(), cancelledRes.json(), rejectedRes.json()
        ]);
        const mapVisit = (v) => ({
          id: v._id,
          inmateName: v.prisoner ? `${v.prisoner.firstName} ${v.prisoner.lastName}` : '-',
          date: new Date(v.visitDate).toISOString().slice(0,10),
          time: v.visitTime,
          status: v.status,
          type: v.purpose || v.relationship || 'Visit'
        });
        const cancelledMerged = [
          ...((cancelled.visits || []).map(mapVisit)),
          ...((rejected.visits || []).map(mapVisit))
        ];

        setVisitHistory({
          completed: (completed.visits || []).map(mapVisit),
          cancelled: cancelledMerged,
          pending: (pending.visits || []).map(mapVisit)
        });
      } catch (e) {
        // Keep defaults if API fails
      }
    };
    loadHistory();
  }, []);

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

                {activeTab === 'pending' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this pending request?')) return;
                        try {
                          const token = sessionStorage.getItem('token');
                          const base = 'http://localhost:5000';
                          const res = await fetch(`${base}/api/visits/${visit.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          if (res.ok) {
                            // Optimistic removal
                            setVisitHistory((prev) => ({
                              ...prev,
                              pending: prev.pending.filter(v => v.id !== visit.id)
                            }));
                          } else {
                            console.warn('Failed to delete visit');
                          }
                        } catch (e) {
                          console.error('Delete visit error', e);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete Request
                    </button>
                  </div>
                )}
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
  // Define validation rules for password reset
  const validationRules = {
    currentPassword: (value) => !value ? 'Current password is required' : '',
    newPassword: (value) => validatePassword(value),
    confirmPassword: (value, formData) => {
      return validateConfirmPassword(value, formData?.newPassword || '');
    }
  };

  // Initialize form validation
  const {
    formData,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    getFieldError,
    isFieldValid
  } = useFormValidation({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }, validationRules);

  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const isFormValid = await validateAllFields();
    if (!isFormValid) {
      setLoading(false);
      showError('Please fix all validation errors before submitting', 'Validation Error');
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
        showSuccess('Password updated successfully!', 'Password Changed');
        onClose();
      } else {
        showError(data.msg || 'Failed to change password', 'Password Change Failed');
      }
    } catch (error) {
      console.error('Password update error:', error);
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
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ValidatedInput
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('currentPassword')}
              isValid={isFieldValid('currentPassword')}
              required
              placeholder="Enter current password"
            />

            <ValidatedInput
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('newPassword')}
              isValid={isFieldValid('newPassword')}
              required
              placeholder="Enter new password"
              helperText="Password must be 8+ characters with letters, numbers, and symbols"
            />

            <ValidatedInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('confirmPassword')}
              isValid={isFieldValid('confirmPassword')}
              required
              placeholder="Confirm new password"
            />

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
