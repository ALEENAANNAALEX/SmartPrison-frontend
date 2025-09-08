import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import {
  FaUserTie,
  FaPlus,
  FaUsers,
  FaUserCheck,
  FaSave,
  FaEye,
  FaEdit
} from 'react-icons/fa';

const ManageStaff = () => {
  // UI state
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [staffLoading, setStaffLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // inline form visibility
  const [editingStaff, setEditingStaff] = useState(null); // when not null -> edit mode

  // Data
  const [staffList, setStaffList] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  // Filters
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Derived: filtered staff list (same logic used in table rendering)
  const filteredStaff = staffList.filter((s) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = term === '' ||
      String(s.name || '').toLowerCase().includes(term) ||
      String(s.email || '').toLowerCase().includes(term);
    const matchesBlock = blockFilter === 'all' ||
      (typeof s.assignedBlock === 'object' ? (s.assignedBlock?.name === blockFilter) : (s.assignedBlock === blockFilter));
    const matchesDept = deptFilter === 'all' || String(s.department || '').toLowerCase() === deptFilter.toLowerCase();
    return matchesSearch && matchesBlock && matchesDept;
  });

  // Form state
  const initialForm = {
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    shift: 'day',
    experience: '',
    assignedBlock: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // Validation helpers
  const validateName = (v) => /^[A-Za-z\s]+$/.test(String(v).trim());
  const sanitizeName = (v) => String(v).replace(/[^A-Za-z\s]/g, '');
  const formatPhone = (v) => String(v).replace(/\D/g, '').slice(0, 10);
  const validatePhone = (v) => {
    const d = String(v || '').replace(/\D/g, '');
    return d.length === 10 && /^[6-9]/.test(d);
  };
  const isEmail = (v) => /.+@.+\..+/.test(String(v));
  const isNumeric = (v) => /^\d+$/.test(String(v));

  // Load staff + blocks
  useEffect(() => {
    fetchStaff();
    fetchBlocks();
  }, []);

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
      setStaffLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffList(data.staff || []);
        } else {
          setStaffList([]);
        }
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  // Helpers
  const showTempNotification = (payload, timeout = 6000) => {
    setNotification(payload);
    setTimeout(() => setNotification(null), timeout);
  };

  const resetForm = () => {
    setFormData(initialForm);
  };

  // Start Add flow - show inline form below heading
  const openAddForm = () => {
    setEditingStaff(null);
    resetForm();
    setShowForm(true);
  };

  // Start Edit flow - prefill form, show inline form
  const openEditForm = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      position: staff.position || '',
      department: staff.department || '',
      shift: (staff.shift || 'day').toLowerCase(),
      experience: staff.experience || '',
      assignedBlock: staff.assignedBlock && staff.assignedBlock._id ? staff.assignedBlock._id : (staff.assignedBlock || '')
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStaff(null);
    resetForm();
  };

  // Submit Add or Edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate basic fields
    const required = ['name','email','phone','position','department','experience','assignedBlock'];
    const missing = required.filter((k) => !String(formData[k] || '').trim());
    if (missing.length) {
      showTempNotification({ type: 'error', message: `Missing required: ${missing.join(', ')}` }, 5000);
      return;
    }

    // Email format
    const emailOk = /.+@.+\..+/.test(formData.email);
    if (!emailOk) {
      showTempNotification({ type: 'error', message: 'Please enter a valid email address.' }, 5000);
      return;
    }

    // Name: letters and spaces only
    const nameOk = /^[A-Za-z\s]+$/.test(String(formData.name).trim());
    if (!nameOk) {
      showTempNotification({ type: 'error', message: 'Name should contain letters and spaces only (no numbers).' }, 5000);
      return;
    }

    // Phone: exactly 10 digits
    const cleanedPhone = String(formData.phone || '').replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      showTempNotification({ type: 'error', message: 'Phone number must be exactly 10 digits.' }, 5000);
      return;
    }

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');

      if (editingStaff) {
        // Try an update call if backend exists; otherwise notify unsupported
        const id = editingStaff.id || editingStaff.userId || editingStaff._id;
        const resp = await fetch(`http://localhost:5000/api/warden/staff/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (resp.ok) {
          showTempNotification({ type: 'success', message: 'Staff updated successfully.' }, 4000);
          closeForm();
          fetchStaff(); 
        } else {
          const txt = await resp.text();
          showTempNotification({ type: 'error', message: `Update failed or not supported (HTTP ${resp.status}).` });
          console.error('Update error:', txt);
        }
      } else {
        // Create new
        const response = await fetch('http://localhost:5000/api/warden/create-staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && data.success) {
          showTempNotification({ type: 'success', message: `Staff created! Password: ${data.staff?.generatedPassword || 'sent via email'}` }, 8000);
          closeForm();
          fetchStaff();
        } else {
          showTempNotification({ type: 'error', message: data.msg || `Failed to create staff (HTTP ${response.status})` }, 6000);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      showTempNotification({ type: 'error', message: 'Network error. Please try again.' }, 6000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WardenLayout title="Manage Staff" subtitle="Create and manage prison staff members">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-start">
            <span className="mr-2">{notification.type === 'success' ? '✅' : '❌'}</span>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header card with search + filters (matches prisoners UI) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
            {/* Icon + total */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaUserTie className="text-purple-600 h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Total Staff: {staffList.length}</h3>
                <p className="text-gray-600">Active staff in the system</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg w-full"
              />
              <select
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Blocks</option>
                {availableBlocks.map((b) => (
                  <option key={b._id} value={b.name}>{b.name}</option>
                ))}
              </select>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Departments</option>
                <option value="Security">Security</option>
                <option value="Medical">Medical</option>
                <option value="Rehabilitation">Rehabilitation</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            {/* Add + showing */}
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-gray-500 text-sm">Showing {filteredStaff.length} of {staffList.length} staff</span>
              <button onClick={openAddForm} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <FaPlus className="mr-2" /> Add New Staff
              </button>
            </div>
          </div>
        </div>

        {/* Inline Add/Edit Form below heading - white background */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
              <button type="button" onClick={closeForm} className="text-indigo-600 hover:underline">Back to list</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const v = sanitizeName(e.target.value);
                      setFormData({ ...formData, name: v });
                    }}
                    onBlur={(e) => {
                      const v = String(e.target.value).trim();
                      if (!validateName(v)) {
                        showTempNotification({ type: 'error', message: 'Name should contain letters and spaces only.' }, 4000);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${formData.name && !validateName(formData.name) ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="Enter full name"
                    required
                  />
                  {formData.name && !validateName(formData.name) && (
                    <p className="mt-1 text-sm text-red-600">Only letters and spaces are allowed.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingStaff}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${editingStaff ? 'bg-gray-100 text-gray-600 cursor-not-allowed border-gray-300' : 'border-gray-300'}`}
                    placeholder="Enter email address"
                    required
                  />
                  {editingStaff && (
                    <p className="mt-1 text-xs text-gray-500">Email cannot be edited.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const v = formatPhone(e.target.value);
                      setFormData({ ...formData, phone: v });
                    }}
                    onBlur={(e) => {
                      const digits = formatPhone(e.target.value);
                      if (!validatePhone(digits)) {
                        const first = digits.charAt(0);
                        const reason = digits.length !== 10 ? 'Phone number must be exactly 10 digits.' : `Phone number cannot start with ${first}. Use a number starting with 6-9.`;
                        showTempNotification({ type: 'error', message: reason }, 5000);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${formData.phone && !validatePhone(formData.phone) ? 'border-red-400' : 'border-gray-300'}`}
                    placeholder="Enter 10-digit phone number (starts with 6-9)"
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    required
                  />
                  {formData.phone && !validatePhone(formData.phone) && (
                    <p className="mt-1 text-sm text-red-600">Must be 10 digits and start with 6–9.</p>
                  )}
                </div>

                {/* Info note about autogenerated staff ID on creation */}
                {!editingStaff && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">Staff ID will be autogenerated (e.g., S001) after creation.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, assignedBlock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select block</option>
                    {availableBlocks.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.blockCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="day">Day Shift</option>
                    <option value="evening">Evening Shift</option>
                    <option value="night">Night Shift</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years) *</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => {
                    const onlyDigits = String(e.target.value).replace(/\D/g, '').slice(0, 2);
                    setFormData({ ...formData, experience: onlyDigits });
                  }}
                  onBlur={(e) => {
                    if (!isNumeric(e.target.value) || String(e.target.value).trim() === '') {
                      showTempNotification({ type: 'error', message: 'Experience must be a numeric value.' }, 4000);
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${!formData.experience || isNumeric(formData.experience) ? 'border-gray-300' : 'border-red-400'}`}
                  placeholder="Enter years of experience (e.g., 5)"
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !validateName(formData.name) ||
                    !validatePhone(formData.phone) ||
                    !isEmail(formData.email) ||
                    !isNumeric(formData.experience) ||
                    String(formData.experience).trim() === ''
                  }
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {submitting ? (editingStaff ? 'Updating...' : 'Creating...') : (editingStaff ? 'Update Staff' : 'Create Staff')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Removed the 3 statistics cards as requested */}

        {/* Staff List */}
        {!showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Staff Members ({filteredStaff.length})</h3>
              <span className="text-gray-500 text-sm">Showing {filteredStaff.length} of {staffList.length}</span>
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
                <p className="text-gray-500">Start by adding your first staff member using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position & Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Block</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaff.map((staff) => (
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
                          <div className="text-xs text-gray-500">{String(staff.shift).charAt(0).toUpperCase() + String(staff.shift).slice(1)} Shift</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{staff.email}</div>
                          <div className="text-sm text-gray-500">{staff.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{typeof staff.assignedBlock === 'object' ? (staff.assignedBlock?.name || 'General') : (staff.assignedBlock || 'General')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditForm(staff)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit Staff"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Delete ${staff.name}? This cannot be undone.`)) return;
                                try {
                                  const token = sessionStorage.getItem('token');
                                  const resp = await fetch(`http://localhost:5000/api/warden/staff/${staff.id || staff.userId || staff._id}`, {
                                    method: 'DELETE',
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  if (resp.ok) {
                                    showTempNotification({ type: 'success', message: 'Staff deleted successfully.' }, 4000);
                                    fetchStaff();
                                  } else {
                                    const txt = await resp.text();
                                    showTempNotification({ type: 'error', message: `Delete failed (HTTP ${resp.status}).` }, 6000);
                                    console.error('Delete error:', txt);
                                  }
                                } catch (e) {
                                  console.error('Delete error:', e);
                                  showTempNotification({ type: 'error', message: 'Network error while deleting.' }, 6000);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Staff"
                            >
                              🗑️
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
        )}
      </div>
    </WardenLayout>
  );
};

export default ManageStaff;
