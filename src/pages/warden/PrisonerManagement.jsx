import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaUsers, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit,
  FaUserTie,
  FaIdCard,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCamera,
  FaUpload,
  FaSave,
  FaTimes,
  FaUser,
  FaPhone,
  FaHome,
  FaGavel,
  FaMedkit,
  FaExclamationTriangle
} from 'react-icons/fa';

const PrisonerManagement = () => {
  const [prisoners, setPrisoners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPrisoner, setSelectedPrisoner] = useState(null);
  const [notification, setNotification] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [prisonerForm, setPrisonerForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 'male',
    nationality: 'Indian',
    height: '',
    weight: '',
    eyeColor: '',
    hairColor: '',
    distinguishingMarks: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactAddress: '',
    charges: '',
    sentenceType: 'fixed_term',
    sentenceLength: '',
    startDate: '',
    expectedReleaseDate: '',
    blockAssignment: 'A',
    cellNumber: '',
    medicalConditions: '',
    allergies: '',
    behaviorLevel: 'medium',
    notes: '',
    photograph: null
  });


  useEffect(() => {
    fetchPrisoners();
  }, []);

  const fetchPrisoners = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/warden/prisoners', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('📋 Fetched prisoners:', data.prisoners);
          setPrisoners(data.prisoners);
        } else {
          console.error('Failed to fetch prisoners:', data.msg);
          setPrisoners([]);
        }
      } else {
        console.error('Failed to fetch prisoners');
        setPrisoners([]);
      }
    } catch (error) {
      console.error('Error fetching prisoners:', error);
      setPrisoners([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setNotification({
          type: 'error',
          message: '❌ File size must be less than 5MB'
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      if (!file.type.startsWith('image/')) {
        setNotification({
          type: 'error',
          message: '❌ Please select an image file'
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      setPrisonerForm({ ...prisonerForm, photograph: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPrisoner = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');

      if (!token) {
        setNotification({
          type: 'error',
          message: '❌ No authentication token found. Please log in again.'
        });
        setTimeout(() => setNotification(null), 5000);
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!prisonerForm.firstName || !prisonerForm.lastName || !prisonerForm.dateOfBirth) {
        setNotification({
          type: 'error',
          message: '❌ Please fill in all required fields (First Name, Last Name, Date of Birth).'
        });
        setTimeout(() => setNotification(null), 5000);
        setLoading(false);
        return;
      }

      console.log('📝 Submitting prisoner form:', prisonerForm);

      // Create FormData for file upload
      const formData = new FormData();

      // Add all form fields to FormData
      Object.keys(prisonerForm).forEach(key => {
        if (key === 'photograph' && prisonerForm[key]) {
          formData.append('photograph', prisonerForm[key]);
          console.log('📷 Adding photo to form data:', prisonerForm[key].name);
        } else if (key !== 'photograph' && prisonerForm[key] !== '') {
          formData.append(key, prisonerForm[key]);
          console.log(`📝 Adding ${key}:`, prisonerForm[key]);
        }
      });

      console.log('🚀 Sending request to backend...');

      const response = await fetch('http://localhost:5000/api/warden/prisoners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response data:', data);

        if (data.success) {
          setNotification({
            type: 'success',
            message: `✅ Prisoner added successfully! Prisoner Number: ${data.prisoner.prisonerNumber}`
          });

          fetchPrisoners(); // Refresh the list

          // Reset form
          setPrisonerForm({
            firstName: '',
            lastName: '',
            middleName: '',
            dateOfBirth: '',
            gender: 'male',
            nationality: 'Indian',
            height: '',
            weight: '',
            eyeColor: '',
            hairColor: '',
            distinguishingMarks: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            emergencyContactName: '',
            emergencyContactRelationship: '',
            emergencyContactPhone: '',
            emergencyContactAddress: '',
            charges: '',
            sentenceType: 'fixed_term',
            sentenceLength: '',
            startDate: '',
            expectedReleaseDate: '',
            blockAssignment: 'A',
            cellNumber: '',
            medicalConditions: '',
            allergies: '',
            behaviorLevel: 'medium',
            notes: '',
            photograph: null
          });
          setPhotoPreview(null);
          setShowAddModal(false);
        } else {
          console.error('❌ Backend returned error:', data);
          setNotification({
            type: 'error',
            message: `❌ ${data.msg || 'Failed to add prisoner'}`
          });
        }
      } else {
        const errorData = await response.text();
        console.error('❌ HTTP Error:', response.status, errorData);
        setNotification({
          type: 'error',
          message: `❌ Failed to add prisoner (${response.status}). Please try again.`
        });
      }

      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      console.error('Add prisoner error:', error);
      setNotification({
        type: 'error',
        message: '❌ Failed to add prisoner. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrisoners = prisoners.filter(prisoner => {
    const matchesSearch = prisoner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prisoner.prisonerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || prisoner.status === filterStatus;
    const matchesGender = filterGender === 'all' || prisoner.gender === filterGender;
    
    return matchesSearch && matchesStatus && matchesGender;
  });

  const getStatusBadge = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'released': 'bg-blue-100 text-blue-800',
      'transferred': 'bg-yellow-100 text-yellow-800',
      'deceased': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getBehaviorBadge = (level) => {
    const colors = {
      'excellent': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[level] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <WardenLayout title="Prisoner Management" subtitle="Manage prisoner records, photos, and details">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-start">
            <span className="mr-2">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
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
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search prisoners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="released">Released</option>
              <option value="transferred">Transferred</option>
            </select>

            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>


        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Prisoners</p>
                <p className="text-2xl font-bold text-gray-900">{prisoners.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaUserTie className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prisoners.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prisoners.filter(p => p.behaviorRecord?.currentLevel === 'poor').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaCalendarAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {prisoners.filter(p => {
                    const admissionDate = new Date(p.admissionDate);
                    const now = new Date();
                    return admissionDate.getMonth() === now.getMonth() &&
                           admissionDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prisoners Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredPrisoners.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No prisoners found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new prisoner.</p>
            </div>
          ) : (
            filteredPrisoners.map((prisoner) => (
              <div key={prisoner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      {prisoner.photograph ? (
                        <img
                          src={`http://localhost:5000${prisoner.photograph}`}
                          alt={prisoner.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${prisoner.photograph ? 'hidden' : ''}`}>
                        <FaUser className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{prisoner.name}</h3>
                      <span className={getStatusBadge(prisoner.status)}>
                        {prisoner.status?.charAt(0).toUpperCase() + prisoner.status?.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">ID: {prisoner.prisonerNumber}</p>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Location:</span>
                        <span className="font-medium">
                          Block {prisoner.currentLocation?.block}, Cell {prisoner.currentLocation?.cell}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Behavior:</span>
                        <span className={getBehaviorBadge(prisoner.behaviorRecord?.currentLevel)}>
                          {prisoner.behaviorRecord?.currentLevel?.charAt(0).toUpperCase() +
                           prisoner.behaviorRecord?.currentLevel?.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Sentence:</span>
                        <span className="font-medium">
                          {prisoner.sentenceDetails?.sentenceLength} months
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-200 mt-4">
                  <button
                    onClick={() => {
                      setSelectedPrisoner(prisoner);
                      setShowDetailsModal(true);
                    }}
                    className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 flex items-center justify-center space-x-1 text-sm"
                  >
                    <FaEye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => {
                      // Edit functionality can be added here
                      console.log('Edit prisoner:', prisoner.id);
                    }}
                    className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-center space-x-1 text-sm"
                  >
                    <FaEdit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Prisoner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Prisoner</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setPhotoPreview(null);
                    setPrisonerForm({
                      firstName: '',
                      lastName: '',
                      middleName: '',
                      dateOfBirth: '',
                      gender: 'male',
                      nationality: 'Indian',
                      height: '',
                      weight: '',
                      eyeColor: '',
                      hairColor: '',
                      distinguishingMarks: '',
                      address: '',
                      city: '',
                      state: '',
                      pincode: '',
                      country: 'India',
                      emergencyContactName: '',
                      emergencyContactRelationship: '',
                      emergencyContactPhone: '',
                      emergencyContactAddress: '',
                      charges: '',
                      sentenceType: 'fixed_term',
                      sentenceLength: '',
                      startDate: '',
                      expectedReleaseDate: '',
                      blockAssignment: 'A',
                      cellNumber: '',
                      medicalConditions: '',
                      allergies: '',
                      behaviorLevel: 'medium',
                      notes: '',
                      photograph: null
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitPrisoner} className="p-6 space-y-6">
              {/* Photo Upload Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaCamera className="mr-2" />
                  Prisoner Photograph
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <FaUser className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No photo</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prisonerForm.firstName}
                      onChange={(e) => setPrisonerForm({...prisonerForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prisonerForm.lastName}
                      onChange={(e) => setPrisonerForm({...prisonerForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.middleName}
                      onChange={(e) => setPrisonerForm({...prisonerForm, middleName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={prisonerForm.dateOfBirth}
                      onChange={(e) => setPrisonerForm({...prisonerForm, dateOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      required
                      value={prisonerForm.gender}
                      onChange={(e) => setPrisonerForm({...prisonerForm, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.nationality}
                      onChange={(e) => setPrisonerForm({...prisonerForm, nationality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Physical Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaIdCard className="mr-2" />
                  Physical Description
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={prisonerForm.height}
                      onChange={(e) => setPrisonerForm({...prisonerForm, height: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={prisonerForm.weight}
                      onChange={(e) => setPrisonerForm({...prisonerForm, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eye Color
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.eyeColor}
                      onChange={(e) => setPrisonerForm({...prisonerForm, eyeColor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hair Color
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.hairColor}
                      onChange={(e) => setPrisonerForm({...prisonerForm, hairColor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distinguishing Marks (comma separated)
                  </label>
                  <input
                    type="text"
                    value={prisonerForm.distinguishingMarks}
                    onChange={(e) => setPrisonerForm({...prisonerForm, distinguishingMarks: e.target.value})}
                    placeholder="e.g., Scar on left arm, Tattoo on right shoulder"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaHome className="mr-2" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.address}
                      onChange={(e) => setPrisonerForm({...prisonerForm, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.city}
                      onChange={(e) => setPrisonerForm({...prisonerForm, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.state}
                      onChange={(e) => setPrisonerForm({...prisonerForm, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.pincode}
                      onChange={(e) => setPrisonerForm({...prisonerForm, pincode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.country}
                      onChange={(e) => setPrisonerForm({...prisonerForm, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaPhone className="mr-2" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.emergencyContactName}
                      onChange={(e) => setPrisonerForm({...prisonerForm, emergencyContactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.emergencyContactRelationship}
                      onChange={(e) => setPrisonerForm({...prisonerForm, emergencyContactRelationship: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={prisonerForm.emergencyContactPhone}
                      onChange={(e) => setPrisonerForm({...prisonerForm, emergencyContactPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.emergencyContactAddress}
                      onChange={(e) => setPrisonerForm({...prisonerForm, emergencyContactAddress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaGavel className="mr-2" />
                  Legal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Charges (JSON format or comma separated)
                    </label>
                    <textarea
                      value={prisonerForm.charges}
                      onChange={(e) => setPrisonerForm({...prisonerForm, charges: e.target.value})}
                      placeholder='[{"charge": "Theft", "severity": "minor"}] or Theft, Burglary'
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sentence Type
                    </label>
                    <select
                      value={prisonerForm.sentenceType}
                      onChange={(e) => setPrisonerForm({...prisonerForm, sentenceType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="fixed_term">Fixed Term</option>
                      <option value="life">Life Sentence</option>
                      <option value="death">Death Sentence</option>
                      <option value="indefinite">Indefinite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sentence Length (months)
                    </label>
                    <input
                      type="number"
                      value={prisonerForm.sentenceLength}
                      onChange={(e) => setPrisonerForm({...prisonerForm, sentenceLength: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sentence Start Date
                    </label>
                    <input
                      type="date"
                      value={prisonerForm.startDate}
                      onChange={(e) => setPrisonerForm({...prisonerForm, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Release Date
                    </label>
                    <input
                      type="date"
                      value={prisonerForm.expectedReleaseDate}
                      onChange={(e) => setPrisonerForm({...prisonerForm, expectedReleaseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Location Assignment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  Location Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Block Assignment
                    </label>
                    <select
                      value={prisonerForm.blockAssignment}
                      onChange={(e) => setPrisonerForm({...prisonerForm, blockAssignment: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="A">Block A</option>
                      <option value="B">Block B</option>
                      <option value="C">Block C</option>
                      <option value="D">Block D</option>
                      <option value="E">Block E</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cell Number
                    </label>
                    <input
                      type="text"
                      value={prisonerForm.cellNumber}
                      onChange={(e) => setPrisonerForm({...prisonerForm, cellNumber: e.target.value})}
                      placeholder="e.g., 101, 205"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaMedkit className="mr-2" />
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical Conditions (comma separated)
                    </label>
                    <textarea
                      value={prisonerForm.medicalConditions}
                      onChange={(e) => setPrisonerForm({...prisonerForm, medicalConditions: e.target.value})}
                      placeholder="e.g., Diabetes, Hypertension"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies (comma separated)
                    </label>
                    <textarea
                      value={prisonerForm.allergies}
                      onChange={(e) => setPrisonerForm({...prisonerForm, allergies: e.target.value})}
                      placeholder="e.g., Penicillin, Nuts"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Behavior and Notes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  Behavior and Notes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Behavior Level
                    </label>
                    <select
                      value={prisonerForm.behaviorLevel}
                      onChange={(e) => setPrisonerForm({...prisonerForm, behaviorLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="medium">Medium</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={prisonerForm.notes}
                      onChange={(e) => setPrisonerForm({...prisonerForm, notes: e.target.value})}
                      placeholder="Any additional information about the prisoner"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setPhotoPreview(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FaTimes className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaSave className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Adding...' : 'Add Prisoner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WardenLayout>
  );
};

export default PrisonerManagement;
