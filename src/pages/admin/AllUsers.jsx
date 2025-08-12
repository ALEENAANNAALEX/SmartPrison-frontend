import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaUserShield, FaUserTie, FaExclamationTriangle } from 'react-icons/fa';
import { useFormValidation } from '../../hooks/useFormValidation';
import ValidatedInput, { ValidatedSelect, ValidatedTextarea, ValidatedCheckbox } from '../../components/ValidatedInput';
import { 
  userValidationRules, 
  userCreationValidationRules, 
  validateEmailUniqueness 
} from '../../utils/validation';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initial form data
  const initialFormData = {
    name: '',
    email: '',
    password: '',
    role: 'visitor',
    phone: '',
    address: '',
    gender: '',
    nationality: '',
    isActive: true
  };

  // Form validation hook
  const {
    formData,
    errors,
    touched,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    resetForm,
    updateFormData,
    getFieldError,
    isFieldValidating,
    hasFieldError,
    isFieldValid
  } = useFormValidation(
    initialFormData,
    editingUser ? userValidationRules : userCreationValidationRules,
    {
      validateOnChange: true,
      validateOnBlur: true,
      debounceMs: 500,
      asyncValidators: {
        email: (email) => validateEmailUniqueness(email, editingUser?._id)
      }
    }
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to create sample users for testing
  const createSampleUsers = async () => {
    const sampleUsers = [
      {
        name: 'John Admin',
        email: 'admin@prison.gov',
        password: 'admin123',
        role: 'admin',
        phone: '+1-555-0101',
        address: '123 Admin Street, Capital City',
        isActive: true
      },
      {
        name: 'Sarah Warden',
        email: 'sarah.warden@prison.gov',
        password: 'warden123',
        role: 'warden',
        phone: '+1-555-0102',
        address: '456 Security Ave, Prison Town',
        isActive: true
      },
      {
        name: 'Mike Visitor',
        email: 'mike.visitor@email.com',
        password: 'visitor123',
        role: 'visitor',
        phone: '+1-555-0103',
        address: '789 Family Lane, Hometown',
        isActive: true
      }
    ];

    try {
      for (const user of sampleUsers) {
        await fetch('http://localhost:5000/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          },
          body: JSON.stringify(user)
        });
      }
      fetchUsers(); // Refresh the list
      alert('Sample users created successfully!');
    } catch (error) {
      console.error('Error creating sample users:', error);
      alert('Error creating sample users. Please try again.');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Users API Response:', data); // Debug log
        if (data.success) {
          setUsers(data.users || []);
        } else {
          console.error('API returned success: false', data.message);
          setUsers([]);
        }
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const isFormValid = await validateAllFields();
    if (!isFormValid) {
      console.log('Form validation failed:', errors);
      return;
    }

    setSubmitting(true);
    
    try {
      const url = editingUser 
        ? `http://localhost:5000/api/admin/users/${editingUser._id}`
        : 'http://localhost:5000/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Prepare data for submission
      const submitData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        nationality: formData.nationality,
        isActive: formData.isActive
      };

      // Only include password if it's provided (for creation or password change)
      if (formData.password) {
        submitData.password = formData.password;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchUsers();
        setShowAddModal(false);
        setEditingUser(null);
        resetForm();
        
        // Show success message
        alert(data.msg || `User ${editingUser ? 'updated' : 'created'} successfully!`);
      } else {
        // Handle server validation errors
        alert(data.msg || 'An error occurred while saving the user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    
    // Update form data with user information
    updateFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for security
      role: user.role,
      phone: user.phoneNumber || '',
      address: user.address || '',
      gender: user.gender || '',
      nationality: user.nationality || '',
      isActive: user.isActive !== false
    });
    
    setShowAddModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          fetchUsers();
          alert(data.msg || 'User deleted successfully');
        } else {
          alert(data.msg || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Network error occurred. Please try again.');
      }
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchUsers();
        alert(data.msg || `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        alert(data.msg || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('Network error occurred. Please try again.');
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === '' || user.role === filterRole;
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="text-red-600" />;
      case 'warden':
        return <FaUserTie className="text-purple-600" />;
      case 'visitor':
        return <FaUsers className="text-blue-600" />;
      default:
        return <FaUsers className="text-gray-600" />;
    }
  };

  const getRoleStats = () => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  if (loading) {
    return (
      <AdminLayout title="All Users" subtitle="Manage system users and their roles">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const roleStats = getRoleStats();

  return (
    <AdminLayout title="All Users" subtitle="Manage system users and their roles">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
              <p className="text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <FaUserShield className="text-2xl text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{roleStats.admin || 0}</h3>
              <p className="text-gray-600">Admins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaUserTie className="text-2xl text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{roleStats.warden || 0}</h3>
              <p className="text-gray-600">Wardens</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaUsers className="text-2xl text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{roleStats.visitor || 0}</h3>
              <p className="text-gray-600">Visitors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
          <button
            onClick={handleAddUser}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="warden">Warden</option>
            <option value="visitor">Visitor</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FaUsers className="text-4xl text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-500 mb-4">
                        {users.length === 0
                          ? "No users have been added to the system yet."
                          : "No users match your current filters."
                        }
                      </p>
                      {users.length === 0 && (
                        <div className="flex gap-3">
                          <button
                            onClick={handleAddUser}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          >
                            Add First User
                          </button>
                          <button
                            onClick={createSampleUsers}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            Create Sample Users
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'warden' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      className={`px-2 py-1 text-xs font-medium rounded-full cursor-pointer transition-colors ${
                        user.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingUser ? 'Edit' : 'Add'} User
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={getFieldError('name')}
                  isValidating={isFieldValidating('name')}
                  isValid={isFieldValid('name')}
                  placeholder="Enter full name"
                  required
                />
                
                <ValidatedInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={getFieldError('email')}
                  isValidating={isFieldValidating('email')}
                  isValid={isFieldValid('email')}
                  placeholder="Enter email address"
                  required
                  disabled={editingUser ? true : false}
                  helperText={editingUser ? "Email cannot be changed after account creation" : ""}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={getFieldError('password')}
                  isValidating={isFieldValidating('password')}
                  isValid={isFieldValid('password')}
                  placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                  required={!editingUser}
                />
                
                <ValidatedSelect
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={getFieldError('role')}
                  isValid={isFieldValid('role')}
                  options={[
                    { value: 'visitor', label: 'Visitor' },
                    { value: 'warden', label: 'Warden' },
                    { value: 'admin', label: 'Admin' }
                  ]}
                  placeholder="Select a role"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={getFieldError('phone')}
                  isValidating={isFieldValidating('phone')}
                  isValid={isFieldValid('phone')}
                  placeholder="Enter 10-digit mobile number"
                  helperText="Must be 10 digits starting with 6, 7, 8, or 9 (optional)"
                  maxLength={10}
                />

                <ValidatedSelect
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleFieldChange}
                  onBlur={handleFieldBlur}
                  error={getFieldError('gender')}
                  isValid={isFieldValid('gender')}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                  placeholder="Select gender (optional)"
                />
              </div>

              <ValidatedInput
                label="Nationality"
                name="nationality"
                type="text"
                value={formData.nationality}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={getFieldError('nationality')}
                isValidating={isFieldValidating('nationality')}
                isValid={isFieldValid('nationality')}
                placeholder="Enter nationality (optional)"
              />
              
              <ValidatedTextarea
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={getFieldError('address')}
                isValid={isFieldValid('address')}
                placeholder="Enter address (optional)"
                rows={3}
              />

              <ValidatedCheckbox
                label="Active User"
                name="isActive"
                checked={formData.isActive}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={getFieldError('isActive')}
              />
              
              {/* Form Validation Summary */}
              {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="text-red-500 mr-2" />
                    <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                  </div>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {Object.entries(errors).map(([field, error]) => (
                      touched[field] && error && (
                        <li key={field}>{error}</li>
                      )
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!isValid && Object.keys(touched).length > 0)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    submitting || (!isValid && Object.keys(touched).length > 0)
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingUser ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    `${editingUser ? 'Update' : 'Create'} User`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">User Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                    selectedUser.role === 'warden' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{selectedUser.phone || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="text-gray-900">{selectedUser.address || 'N/A'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  handleEdit(selectedUser);
                }}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AllUsers;
