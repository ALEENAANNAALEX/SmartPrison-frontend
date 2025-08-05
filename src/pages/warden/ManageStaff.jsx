import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import {
  FaUserTie,
  FaPlus,
  FaUsers,
  FaUserCheck,
  FaSave,
  FaTimes,
  FaEye,
  FaEdit
} from 'react-icons/fa';

const ManageStaff = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  // Form data for adding new staff
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    position: '',
    department: '',
    shift: 'day',
    experience: '',
    assignedBlock: ''
  });

  // Fetch staff data on component mount
  useEffect(() => {
    console.log('🚀 ManageStaff component mounted, calling fetchStaff...');
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      console.log('🔍 Starting fetchStaff function...');
      setStaffLoading(true);
      const token = sessionStorage.getItem('token');
      console.log('🔑 Token from sessionStorage:', token ? 'Token exists' : 'No token found');

      const response = await fetch('http://localhost:5000/api/warden/staff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 API Response data:', data);
        if (data.success) {
          console.log('✅ Successfully fetched staff data:', data.staff);
          setStaffList(data.staff);
        } else {
          console.error('❌ API returned success=false:', data.msg);
          setStaffList([]);
        }
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to fetch staff. Status:', response.status, 'Error:', errorData);
        setStaffList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      setStaffList([]);
    } finally {
      setStaffLoading(false);
      console.log('🏁 fetchStaff function completed');
    }
  };

  // Generate 8-digit password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/create-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          message: `✅ Staff created! Password: ${data.staff.generatedPassword}`,
          email: formData.email
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          employeeId: '',
          position: '',
          department: '',
          shift: 'day',
          experience: '',
          assignedBlock: ''
        });
        setShowAddModal(false);

        // Refresh staff list
        fetchStaff();

        setTimeout(() => setNotification(null), 10000);
      } else {
        setNotification({
          type: 'error',
          message: `❌ ${data.msg || 'Failed to create staff'}`
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: '❌ Network error. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WardenLayout title="Manage Staff" subtitle="Create and manage prison staff members">
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
              {notification.email && (
                <p className="text-sm mt-1">Email sent to: {notification.email}</p>
              )}
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add New Staff
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUserTie className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaUserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaUsers className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Staff Members ({staffList.length})
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Staff Member
            </button>
          </div>

          {staffLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading staff members...</p>
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-12">
              <FaUserTie className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members yet</h3>
              <p className="text-gray-500 mb-4">Start by adding your first staff member</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Staff Member
              </button>
            </div>
          ) : (
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
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FaUserTie className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                            <div className="text-sm text-gray-500">ID: {staff.employeeId}</div>
                            <div className="text-sm text-gray-500">{staff.experience}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.position}</div>
                        <div className="text-sm text-gray-500">{staff.department}</div>
                        <div className="text-xs text-gray-500">
                          {staff.shift} Shift
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.email}</div>
                        <div className="text-sm text-gray-500">{staff.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.assignedBlock}</div>
                        <div className="text-xs text-gray-500">
                          Joined: {new Date(staff.joiningDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => alert(`Viewing details for ${staff.name}`)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => alert(`Editing ${staff.name}`)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Staff"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add New Staff Member</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID *</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter employee ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
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
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
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
                    value={formData.assignedBlock}
                    onChange={(e) => setFormData({...formData, assignedBlock: e.target.value})}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({...formData, shift: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="day">Day Shift</option>
                    <option value="evening">Evening Shift</option>
                    <option value="night">Night Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
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
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {loading ? 'Creating...' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WardenLayout>
  );
};

export default ManageStaff;
