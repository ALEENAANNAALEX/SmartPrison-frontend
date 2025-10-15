import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaUserTie, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEye, 
  FaEdit,
  FaTrash,
  FaUserCheck,
  FaUserClock,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaClock,
  FaMapMarkerAlt,
  FaSave,
  FaArrowLeft,
  FaTimes,
  FaUser,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterShift, setFilterShift] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [notification, setNotification] = useState(null);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Form states for adding/editing staff
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    shift: 'day',
    experience: '',
    assignedBlock: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (!/^[A-Za-z\s]+$/.test(name.trim())) return 'Name should contain only letters and spaces';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/.+@.+\..+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone is required';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return 'Phone must be exactly 10 digits';
    if (!/^[6-9]/.test(cleaned)) return 'Phone must start with 6-9';
    return '';
  };

  const validateExperience = (exp) => {
    if (!exp.trim()) return 'Experience is required';
    if (!/^\d+$/.test(exp)) return 'Experience must be a number';
    const numExp = parseInt(exp);
    if (numExp < 0 || numExp > 39) return 'Experience must be between 0 and 39 years';
    return '';
  };

  const validateForm = () => {
    const errors = {};
    errors.name = validateName(staffForm.name);
    errors.email = validateEmail(staffForm.email);
    errors.phone = validatePhone(staffForm.phone);
    errors.experience = validateExperience(staffForm.experience);
    if (!staffForm.position) errors.position = 'Position is required';
    if (!staffForm.department) errors.department = 'Department is required';
    if (!staffForm.assignedBlock) errors.assignedBlock = 'Assigned block is required';
    
    setFormErrors(errors);
    return Object.values(errors).every(error => error === '');
  };

  // Mock data for staff
  const mockStaff = [
    {
      id: 1,
      employeeId: 'EMP001',
      name: 'Sarah Wilson',
      position: 'Security Officer',
      department: 'Security',
      email: 'sarah.wilson@prison.gov',
      phone: '+1234567890',
      status: 'Active',
      shift: 'Day',
      joinDate: '2022-01-15',
      experience: '5 years',
      assignedBlock: 'Block A',
      lastLogin: '2024-01-20 09:30',
      performance: 'Excellent'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      name: 'Dr. Michael Brown',
      position: 'Medical Officer',
      department: 'Medical',
      email: 'michael.brown@prison.gov',
      phone: '+1234567891',
      status: 'Active',
      shift: 'Day',
      joinDate: '2021-06-20',
      experience: '8 years',
      assignedBlock: 'Medical Wing',
      lastLogin: '2024-01-20 08:15',
      performance: 'Excellent'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      name: 'James Rodriguez',
      position: 'Correctional Officer',
      department: 'Security',
      email: 'james.rodriguez@prison.gov',
      phone: '+1234567892',
      status: 'On Leave',
      shift: 'Night',
      joinDate: '2023-03-10',
      experience: '2 years',
      assignedBlock: 'Block B',
      lastLogin: '2024-01-18 22:45',
      performance: 'Good'
    },
    {
      id: 4,
      employeeId: 'EMP004',
      name: 'Lisa Chen',
      position: 'Rehabilitation Counselor',
      department: 'Rehabilitation',
      email: 'lisa.chen@prison.gov',
      phone: '+1234567893',
      status: 'Active',
      shift: 'Day',
      joinDate: '2022-09-05',
      experience: '3 years',
      assignedBlock: 'Counseling Center',
      lastLogin: '2024-01-20 10:20',
      performance: 'Good'
    }
  ];

  useEffect(() => {
    fetchStaff();
    fetchBlocks();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterDepartment, filterStatus, filterShift]);

  const fetchBlocks = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/warden/blocks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.blocks)) {
          setAvailableBlocks(data.blocks);
        }
      }
    } catch (e) {
      console.warn('Failed to load blocks', e);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/staff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaff(data.staff || []);
        } else {
          setStaff(mockStaff);
        }
      } else {
        setStaff(mockStaff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff(mockStaff);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Please fix the form errors before submitting.' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const payload = {
        ...staffForm,
        assignedBlock: staffForm.assignedBlock === 'all-blocks' ? null : staffForm.assignedBlock,
        shift: staffForm.shift.toLowerCase()
      };

      if (editingStaff) {
        // Update existing staff
        const id = editingStaff.id || editingStaff.userId || editingStaff._id;
        const response = await fetch(`http://localhost:5000/api/warden/staff/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setNotification({ type: 'success', message: '✅ Staff updated successfully!' });
          fetchStaff();
          closeForm();
        } else {
          setNotification({ type: 'error', message: '❌ Failed to update staff.' });
        }
      } else {
        // Create new staff
        const response = await fetch('http://localhost:5000/api/warden/create-staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          setNotification({ 
            type: 'success', 
            message: `✅ Staff created! Password: ${data.staff?.generatedPassword || 'sent via email'}` 
          });
          fetchStaff();
          closeForm();
        } else {
          setNotification({ type: 'error', message: '❌ Failed to create staff: ' + (data.msg || 'Unknown error') });
        }
      }

      setTimeout(() => setNotification(null), 8000);
    } catch (error) {
      console.error('Submit error:', error);
      setNotification({ type: 'error', message: '❌ Network error. Please try again.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffMember) => {
    if (!window.confirm(`Delete ${staffMember.name}? This cannot be undone.`)) return;

    try {
      const token = sessionStorage.getItem('token');
      const id = staffMember.id || staffMember.userId || staffMember._id;
      const response = await fetch(`http://localhost:5000/api/warden/staff/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setNotification({ type: 'success', message: '✅ Staff deleted successfully!' });
        fetchStaff();
      } else {
        setNotification({ type: 'error', message: '❌ Failed to delete staff.' });
      }

      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Delete error:', error);
      setNotification({ type: 'error', message: '❌ Network error while deleting.' });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const openAddForm = () => {
    setEditingStaff(null);
    setStaffForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      shift: 'day',
      experience: '',
      assignedBlock: ''
    });
    setShowAddForm(true);
  };

  const openViewDetails = (staffMember) => {
    setViewingStaff(staffMember);
  };

  const closeViewDetails = () => {
    setViewingStaff(null);
  };

  const openEditForm = (staffMember) => {
    setEditingStaff(staffMember);
    setStaffForm({
      name: staffMember.name || '',
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      position: staffMember.position || '',
      department: staffMember.department || '',
      shift: (staffMember.shift || 'day').toLowerCase(),
      experience: staffMember.experience || '',
      assignedBlock: (staffMember.assignedBlock && staffMember.assignedBlock._id)
        ? staffMember.assignedBlock._id
        : (staffMember.assignedBlock ? staffMember.assignedBlock : 'all-blocks')
    });
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingStaff(null);
    setStaffForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      shift: 'day',
      experience: '',
      assignedBlock: ''
    });
    setFormErrors({});
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || member.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesShift = filterShift === 'all' || member.shift.toLowerCase() === filterShift.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesShift;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredStaff.length);
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-red-100 text-red-800',
      'Training': 'bg-blue-100 text-blue-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getShiftBadge = (shift) => {
    const shiftColors = {
      'Day': 'bg-blue-100 text-blue-800',
      'Night': 'bg-purple-100 text-purple-800',
      'Evening': 'bg-orange-100 text-orange-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${shiftColors[shift] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPerformanceBadge = (performance) => {
    const performanceColors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${performanceColors[performance] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading && !showAddForm) {
    return (
      <WardenLayout title="Staff Management" subtitle="Manage prison staff and personnel">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Staff Management" subtitle="Manage prison staff and personnel">
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
            <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Top summary when adding staff - show total count like Prisoner page */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUserTie className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-lg font-semibold text-gray-900">Total Staff: {staff.length}</p>
                <p className="text-sm text-gray-600">Active staff in the system</p>
              </div>
            </div>
          </div>
        )}
        {/* Search and Filters */}
        {!showAddForm && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="Security">Security</option>
              <option value="Medical">Medical</option>
              <option value="Rehabilitation">Rehabilitation</option>
              <option value="Administration">Administration</option>
              
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              
            </select>
            
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Shifts</option>
              <option value="day">Day Shift</option>
              <option value="evening">Evening Shift</option>
              <option value="night">Night Shift</option>
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredStaff.length} of {staff.length} staff
            </div>
          </div>
        )}

        {/* Add/Edit Staff Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={closeForm}
                className="inline-flex items-center text-indigo-600 hover:underline"
              >
                <FaArrowLeft className="mr-1" /> Back to list
              </button>
            </div>

            <form onSubmit={handleSubmitStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      setStaffForm({ ...staffForm, name: value });
                      setFormErrors({ ...formErrors, name: validateName(value) });
                    }}
                    onBlur={() => setFormErrors({ ...formErrors, name: validateName(staffForm.name) })}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.name ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                    required
                  />
                  {formErrors.name && <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStaffForm({ ...staffForm, email: value });
                      setFormErrors({ ...formErrors, email: validateEmail(value) });
                    }}
                    onBlur={() => setFormErrors({ ...formErrors, email: validateEmail(staffForm.email) })}
                    disabled={!!editingStaff}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                      editingStaff ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300' : 
                      formErrors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                    required
                  />
                  {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
                  {editingStaff && <p className="text-xs text-gray-500 mt-1">Email cannot be edited.</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setStaffForm({ ...staffForm, phone: value });
                      setFormErrors({ ...formErrors, phone: validatePhone(value) });
                    }}
                    onBlur={() => setFormErrors({ ...formErrors, phone: validatePhone(staffForm.phone) })}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.phone ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit phone number"
                    required
                  />
                  {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Position *</label>
                  <select
                    value={staffForm.position}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStaffForm({ ...staffForm, position: value });
                      setFormErrors({ ...formErrors, position: value ? '' : 'Position is required' });
                    }}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.position ? 'border-red-400' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select position</option>
                    <option value="Security Officer">Security Officer</option>
                    <option value="Correctional Officer">Correctional Officer</option>
                    <option value="Medical Officer">Medical Officer</option>
                    <option value="Rehabilitation Counselor">Rehabilitation Counselor</option>
                    <option value="Prison Control Room Officer">Prison Control Room Officer</option>
                  </select>
                  {formErrors.position && <p className="text-xs text-red-600 mt-1">{formErrors.position}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Department *</label>
                  <select
                    value={staffForm.department}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStaffForm({ ...staffForm, department: value });
                      setFormErrors({ ...formErrors, department: value ? '' : 'Department is required' });
                    }}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.department ? 'border-red-400' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Security">Security</option>
                    <option value="Medical">Medical</option>
                    <option value="Rehabilitation">Rehabilitation</option>
                    <option value="Administration">Administration</option>
                  </select>
                  {formErrors.department && <p className="text-xs text-red-600 mt-1">{formErrors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Block *</label>
                  <select
                    value={staffForm.assignedBlock}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStaffForm({ ...staffForm, assignedBlock: value });
                      setFormErrors({ ...formErrors, assignedBlock: value ? '' : 'Assigned block is required' });
                    }}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.assignedBlock ? 'border-red-400' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select block</option>
                    <option value="all-blocks">All Blocks</option>
                    {availableBlocks.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                  {formErrors.assignedBlock && <p className="text-xs text-red-600 mt-1">{formErrors.assignedBlock}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Shift</label>
                  <select
                    value={staffForm.shift}
                    onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="day">Day Shift</option>
                    <option value="night">Night Shift</option>
                    <option value="rotating">Rotating Shift</option>
                    <option value="all">All Shifts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience (years) *</label>
                  <input
                    type="text"
                    value={staffForm.experience}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                      setStaffForm({ ...staffForm, experience: value });
                      setFormErrors({ ...formErrors, experience: validateExperience(value) });
                    }}
                    onBlur={() => setFormErrors({ ...formErrors, experience: validateExperience(staffForm.experience) })}
                    className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.experience ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Enter years of experience"
                    required
                  />
                  {formErrors.experience && <p className="text-xs text-red-600 mt-1">{formErrors.experience}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Back to list
                </button>
                <button
                  type="submit"
                  disabled={loading || Object.values(formErrors).some(error => error !== '')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : (editingStaff ? 'Update Staff' : 'Create Staff')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Statistics Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${showAddForm ? 'hidden' : ''}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUserTie className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaUserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaUserClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.status === 'On Leave').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaClock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Night Shift</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.shift === 'Night').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${showAddForm ? 'hidden' : ''}`}>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Staff Members ({filteredStaff.length})
            </h3>
            <button
              onClick={openAddForm}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" />
              Add Staff
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">ID: {member.employeeId}</div>
                          <div className="text-sm text-gray-500">{member.experience} experience</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.position}</div>
                      <div className="text-sm text-gray-500">{member.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaPhone className="mr-2 text-gray-400" />
                        {member.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getStatusBadge(member.status)}>
                          {member.status}
                        </span>
                        <div>
                          <span className={getShiftBadge(member.shift)}>
                            {member.shift} Shift
                          </span>
                        </div>
                        {member.performance && (
                          <div>
                            <span className={getPerformanceBadge(member.performance)}>
                              {member.performance}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {typeof member.assignedBlock === 'object' ? (member.assignedBlock?.name || 'All Blocks') : (member.assignedBlock || 'All Blocks')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openViewDetails(member)}
                          className="text-teal-600 hover:text-teal-900"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEditForm(member)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Staff"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(member)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Staff"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredStaff.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center justify-end gap-3">
                {/* Left Arrow */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`h-10 w-10 flex items-center justify-center rounded-full border shadow-sm transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-indigo-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-label="Previous page"
                  title="Previous"
                >
                  <FaChevronLeft />
                </button>

                {/* Single Page Bubble */}
                <div
                  className="h-10 min-w-10 px-3 flex items-center justify-center rounded-full bg-indigo-700 text-white text-lg font-bold shadow-sm select-none"
                  title={`Page ${currentPage} of ${totalPages}`}
                >
                  {currentPage}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`h-10 w-10 flex items-center justify-center rounded-full border shadow-sm transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-indigo-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-label="Next page"
                  title="Next"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
          
          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <FaUserTie className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Staff Details Modal */}
      {viewingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Staff Details</h3>
                <button
                  onClick={closeViewDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingStaff.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingStaff.employeeId}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      {viewingStaff.email}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {viewingStaff.phone}
                    </p>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Professional Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingStaff.position}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingStaff.department}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingStaff.experience} years</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shift</label>
                    <div className="mt-1">
                      <span className={getShiftBadge(viewingStaff.shift)}>
                        {viewingStaff.shift} Shift
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Assignment */}
              <div className="mt-6 space-y-4">
                <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Status & Assignment</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={getStatusBadge(viewingStaff.status)}>
                        {viewingStaff.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned Block</label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-400" />
                      {typeof viewingStaff.assignedBlock === 'object' 
                        ? (viewingStaff.assignedBlock?.name || 'All Blocks') 
                        : (viewingStaff.assignedBlock || 'All Blocks')
                      }
                    </p>
                  </div>
                </div>
                
                {viewingStaff.performance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Performance</label>
                    <div className="mt-1">
                      <span className={getPerformanceBadge(viewingStaff.performance)}>
                        {viewingStaff.performance}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeViewDetails}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeViewDetails();
                    openEditForm(viewingStaff);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Edit Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </WardenLayout>
  );
};

export default StaffManagement;