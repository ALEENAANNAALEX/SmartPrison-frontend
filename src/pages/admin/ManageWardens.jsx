import React, { useState, useEffect } from 'react'; // React core + hooks
import AdminLayout from '../../components/AdminLayout'; // Admin layout wrapper
import { FaUserTie, FaPlus, FaEdit, FaTrash, FaBuilding, FaEye, FaArrowLeft } from 'react-icons/fa'; // Icons for UI
import ValidatedInput, { ValidatedSelect } from '../../components/ValidatedInput'; // Custom validated inputs
import { useFormValidation } from '../../hooks/useFormValidation'; // Reusable form validation hook
import {
  validateName,
  validateEmail,
  validateUserPhone,
  validateExperience,
  validateSpecialization,
  validateShift,
  validateAssignedBlocks,
  wardenValidationRules,
  formatPhoneNumber,
  filterPhoneInput
} from '../../utils/validation'; // Validation helpers & rules

// Section: Component blueprint
// - State: wardens list, blocks list, loading flags, modal visibility, editing warden
// - Form: managed by useFormValidation (formData, errors, touched, validators)
// - Effects: fetch wardens and blocks on mount
// - API: CRUD for wardens, fetch blocks
// - Handlers: create/update/delete, edit, reset, and validation interactions
// - Render: table with actions and controlled modal form

const ManageWardens = () => {
  const [wardens, setWardens] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [unallocatedBlocks, setUnallocatedBlocks] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [allBlocksAllocated, setAllBlocksAllocated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWarden, setEditingWarden] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form validation setup
  const {
    formData,
    errors,
    touched,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    validateAllFields,
    getFieldError,
    isFieldValid,
    resetForm,
    updateFormData
  } = useFormValidation({
    name: '',
    email: '',
    phone: '',
    assignedBlocks: [],
    shift: 'day',
    experience: '',
    specialization: ''
  }, wardenValidationRules);

  useEffect(() => {
    fetchWardens();
    fetchBlocks();
  }, []);

  // Calculate available blocks for assignment
  const calculateAvailableBlocks = (editingWarden) => {
    if (!editingWarden) {
      // For new warden, only show unallocated blocks
      setAvailableBlocks(unallocatedBlocks);
    } else {
      // For editing warden, show unallocated blocks + currently assigned blocks
      const currentlyAssignedBlockIds = editingWarden.wardenDetails?.assignedBlocks?.map(block => block._id) || [];
      const currentlyAssignedBlocks = blocks.filter(block => 
        currentlyAssignedBlockIds.includes(block._id)
      );
      const availableForAssignment = [...unallocatedBlocks, ...currentlyAssignedBlocks];
      setAvailableBlocks(availableForAssignment);
    }
  };

  // Update available blocks when editingWarden or unallocatedBlocks change
  useEffect(() => {
    calculateAvailableBlocks(editingWarden);
  }, [editingWarden, unallocatedBlocks, blocks]);


  const fetchWardens = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/wardens', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched wardens data:', data);
        if (data.success) {
          setWardens(data.wardens);
        }
      }
    } catch (error) {
      console.error('Error fetching wardens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      // Fetch all blocks
      const allBlocksResponse = await fetch('http://localhost:5000/api/admin/blocks', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      // Fetch unallocated blocks
      const unallocatedBlocksResponse = await fetch('http://localhost:5000/api/admin/blocks/unallocated', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (allBlocksResponse.ok && unallocatedBlocksResponse.ok) {
        const allBlocksData = await allBlocksResponse.json();
        const unallocatedBlocksData = await unallocatedBlocksResponse.json();
        
        if (allBlocksData.success && unallocatedBlocksData.success) {
          setBlocks(allBlocksData.blocks);
          setUnallocatedBlocks(unallocatedBlocksData.blocks);
          
          
          // Check if all blocks are allocated
          const activeBlocks = allBlocksData.blocks.filter(block => block.isActive);
          const allocatedBlocks = activeBlocks.filter(block => 
            block.assignedWardens && block.assignedWardens.length > 0
          );
          
          setAllBlocksAllocated(activeBlocks.length > 0 && allocatedBlocks.length === activeBlocks.length);
        }
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Validate all fields
    const isFormValid = await validateAllFields();
    console.log('Form validation result:', isFormValid);
    console.log('Form errors:', errors);
    if (!isFormValid) {
      setSubmitLoading(false);
      alert('Please fix all validation errors before submitting. Errors: ' + JSON.stringify(errors));
      return;
    }

    try {
      const url = editingWarden 
        ? `http://localhost:5000/api/admin/wardens/${editingWarden._id}`
        : 'http://localhost:5000/api/admin/wardens';
      
      const method = editingWarden ? 'PUT' : 'POST';
      
      console.log('Submitting warden data:', formData);
      
      // Employee ID will be auto-generated on the backend
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok && data.success) {
        fetchWardens();
        setShowAddModal(false);
        setEditingWarden(null);
        resetForm();
        alert(editingWarden ? 'Warden updated successfully!' : 'Warden created successfully!');
      } else {
        console.error('Server error:', data);
        alert(data.msg || 'Failed to save warden');
      }
    } catch (error) {
      console.error('Error saving warden:', error);
      alert('Network error. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (warden) => {
    setEditingWarden(warden);
    updateFormData({
      name: warden.name,
      email: warden.email,
      phone: warden.phoneNumber || '',
      assignedBlocks: warden.wardenDetails?.assignedBlocks?.map(block => block._id) || [],
      shift: warden.wardenDetails?.shift || 'day',
      experience: warden.wardenDetails?.experience?.toString() || '',
      specialization: warden.wardenDetails?.specialization || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (wardenId) => {
    if (window.confirm('Are you sure you want to delete this warden?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/wardens/${wardenId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          fetchWardens();
          alert('Warden deleted successfully!');
        } else {
          alert(data.msg || 'Failed to delete warden');
        }
      } catch (error) {
        console.error('Error deleting warden:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Manage Wardens" subtitle="Assign and manage prison wardens">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Wardens" subtitle="Assign and manage prison wardens">
      {/* Warning Message when all blocks are allocated */}
      {allBlocksAllocated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                All Prison Blocks Allocated
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>All active prison blocks are currently assigned to existing wardens. You cannot add new wardens until blocks become available or you reassign existing wardens.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaUserTie className="text-2xl text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Total Wardens: {wardens.length}</h3>
              <p className="text-gray-600">
                {allBlocksAllocated 
                  ? 'All prison blocks are allocated - Cannot add new wardens' 
                  : 'Active wardens in the system'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingWarden(null);
              setShowAddModal(true);
            }}
            disabled={allBlocksAllocated}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              allBlocksAllocated 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            title={allBlocksAllocated ? 'Cannot add new warden: All blocks are allocated' : 'Add new warden'}
          >
            <FaPlus /> Add New Warden
          </button>
        </div>
      </div>

      {/* Add/Edit Inline Panel */}
      {showAddModal && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {editingWarden ? 'Edit Warden' : 'Add New Warden'}
            </h3>
            <button
              type="button"
              onClick={() => { 
                setShowAddModal(false); 
                setEditingWarden(null); 
                resetForm(); 
              }}
              className="inline-flex items-center bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              <FaArrowLeft className="mr-1" /> Back to list
            </button>
          </div>
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
                isValid={isFieldValid('name')}
                required
                placeholder="Enter warden's full name"
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
                placeholder="Enter email address"
                helperText={editingWarden ? "Email can be updated if needed" : "A temporary password will be auto-generated and sent to this email address"}
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
                isValid={isFieldValid('phone')}
                placeholder="Enter 10-digit phone number"
                helperText="Optional: Contact phone number (10 digits)"
                maxLength="10"
              />
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <p className="text-sm text-gray-600 italic">
                  {editingWarden ? 
                    `Current ID: ${editingWarden.wardenDetails?.employeeId || 'Not assigned'}` : 
                    'Will be auto-generated upon creation'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Employee ID is automatically generated by the system</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Blocks</label>
              <select
                multiple
                value={formData.assignedBlocks}
                onChange={(e) => {
                  const selectedBlocks = Array.from(e.target.selectedOptions, option => option.value);
                  handleFieldChange('assignedBlocks', selectedBlocks);
                }}
                onBlur={() => handleFieldBlur('assignedBlocks')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  getFieldError('assignedBlocks') ? 'border-red-500' : 
                  isFieldValid('assignedBlocks') ? 'border-green-500' : 'border-gray-300'
                }`}
                size="4"
              >
                {availableBlocks.length === 0 ? (
                  <option value="" disabled>No blocks available for assignment</option>
                ) : (
                  availableBlocks.map((block) => {
                    const isCurrentlyAssigned = editingWarden?.wardenDetails?.assignedBlocks?.some(
                      assignedBlock => assignedBlock._id === block._id
                    );
                    return (
                      <option key={block._id} value={block._id}>
                        {block.name} ({block.blockCode}){isCurrentlyAssigned ? ' - Currently Assigned' : ''}
                      </option>
                    );
                  })
                )}
              </select>
              {getFieldError('assignedBlocks') && (
                <p className="text-sm text-red-600 mt-1">{getFieldError('assignedBlocks')}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {editingWarden 
                  ? 'Hold Ctrl/Cmd to select multiple blocks. Currently assigned blocks are marked.' 
                  : unallocatedBlocks.length === 0 
                    ? 'All blocks are currently allocated to existing wardens' 
                    : 'Optional: Hold Ctrl/Cmd to select multiple blocks'
                }
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ValidatedSelect
                label="Shift"
                name="shift"
                value={formData.shift}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={getFieldError('shift')}
                isValid={isFieldValid('shift')}
                required
                options={[
                  { value: 'day', label: 'Day Shift' },
                  { value: 'night', label: 'Night Shift' },
                  { value: 'rotating', label: 'Rotating Shift' }
                ]}
              />
              <ValidatedInput
                label="Experience (Years)"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                error={getFieldError('experience')}
                isValid={isFieldValid('experience')}
                placeholder="Enter years of experience (optional)"
                helperText="Optional: Years of relevant experience"
                min="0"
                max="50"
              />
            </div>
            <ValidatedInput
              label="Specialization"
              name="specialization"
              type="text"
              value={formData.specialization}
              onChange={handleFieldChange}
              onBlur={handleFieldBlur}
              error={getFieldError('specialization')}
              isValid={isFieldValid('specialization')}
              placeholder="e.g., Security, Rehabilitation, Administration"
              helperText="Optional: Area of expertise or specialization"
            />
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => { 
                  setShowAddModal(false); 
                  setEditingWarden(null); 
                  resetForm(); 
                }}
                disabled={submitLoading}
                className="inline-flex items-center flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                <FaArrowLeft className="mr-1" /> Back to list
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingWarden ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  `${editingWarden ? 'Update' : 'Create'} Warden`
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wardens Table */}
      {!showAddModal && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Blocks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wardens.map((warden) => (
                <tr key={warden._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FaUserTie className="text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{warden.name}</div>
                        <div className="text-sm text-gray-500">{warden.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {warden.wardenDetails?.employeeId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {warden.wardenDetails?.assignedBlocks?.map((block) => (
                        <span key={block._id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {block.name}
                        </span>
                      )) || <span className="text-gray-500 text-sm">No blocks assigned</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      warden.wardenDetails?.shift === 'day' ? 'bg-yellow-100 text-yellow-800' :
                      warden.wardenDetails?.shift === 'night' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {(warden.wardenDetails?.shift || 'day').charAt(0).toUpperCase() + (warden.wardenDetails?.shift || 'day').slice(1)} Shift
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {warden.wardenDetails?.experience !== undefined ? `${warden.wardenDetails.experience} years` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      warden.wardenDetails?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {warden.wardenDetails?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(warden)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(warden._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

    </AdminLayout>
  );
};

export default ManageWardens;

// File purpose: Admin page to manage wardens: list, create, edit, delete with validation and assigned blocks.
// Frontend location: Route /admin/wardens (Admin > Manage Wardens) via App.jsx routing.
// Backend endpoints used: GET/POST/PUT/DELETE http://localhost:5000/api/admin/wardens; GET http://localhost:5000/api/admin/blocks.
// Auth: Requires Bearer token from sessionStorage.
// UI container: AdminLayout; uses custom ValidatedInput and validation hooks.
