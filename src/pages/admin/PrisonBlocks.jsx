import React, { useState, useEffect } from 'react'; // React + hooks for state and lifecycle
import AdminLayout from '../../components/AdminLayout'; // Admin layout wrapper
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaUsers, FaEye, FaArrowLeft } from 'react-icons/fa'; // Icons for block list/actions
import { useNotification } from '../../contexts/NotificationContext'; // Notification system

// Section: Component blueprint
// - State: blocks list, loading, form visibility, editing block, formData
// - Effects: fetch blocks on mount
// - API: CRUD for blocks via /api/admin/blocks
// - Handlers: open/close form, submit create/update, delete, reset form
// - Render: list with actions and modal form

const PrisonBlocks = () => {
  const { showSuccess, showError } = useNotification();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [totalSystemCapacity, setTotalSystemCapacity] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    blockCode: '',
    securityLevel: 'medium',
    totalCapacity: '',
    description: '',
    cells: ''
  });

  useEffect(() => {
    fetchBlocks();
    fetchSystemCapacity();
  }, []);

  const fetchSystemCapacity = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings.general) {
          setTotalSystemCapacity(data.settings.general.capacity || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching system capacity:', error);
    }
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    // Clear previous error
    delete errors[name];

    switch (name) {
      case 'name':
        if (!value || value.trim().length < 2) {
          errors[name] = 'Block name must be at least 2 characters long';
        }
        break;
      case 'blockCode':
        if (!value || value.trim().length < 1) {
          errors[name] = 'Block code is required';
        }
        break;

      case 'totalCapacity':
        const capacity = parseInt(value);
        if (!capacity || capacity < 1) {
          errors[name] = 'Capacity must be at least 1';
        } else {
          // Calculate total capacity of other blocks
          const otherBlocksCapacity = blocks
            .filter(block => editingBlock ? block._id !== editingBlock._id : true)
            .reduce((sum, block) => sum + (block.totalCapacity || 0), 0);
          
          const totalWithThisBlock = otherBlocksCapacity + capacity;
          
          if (totalWithThisBlock > totalSystemCapacity) {
            errors[name] = `Total block capacity (${totalWithThisBlock}) exceeds system capacity (${totalSystemCapacity})`;
          }
        }
        break;
      case 'cells':
        if (value && parseInt(value) < 1) {
          errors[name] = 'Number of cells must be at least 1';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    validateField(name, value);
  };

  const fetchBlocks = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/blocks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBlocks(data.blocks);
        }
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBlock 
        ? `http://localhost:5000/api/admin/blocks/${editingBlock._id}`
        : 'http://localhost:5000/api/admin/blocks';
      
      const method = editingBlock ? 'PUT' : 'POST';
      
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(data.msg || (editingBlock ? 'Block updated successfully!' : 'Block created successfully!'));
        fetchBlocks();
        setShowForm(false);
        setEditingBlock(null);
        setFormData({
          name: '',
          securityLevel: 'medium',
          totalCapacity: '',
          description: '',
          cells: ''
        });
      } else {
        const data = await response.json();
        showError(data.msg || 'Failed to save block');
      }
    } catch (error) {
      console.error('Error saving block:', error);
      showError('Network error. Please try again.');
    }
  };

  const handleEdit = (block) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      blockCode: block.blockCode || '',
      securityLevel: block.securityLevel,
      totalCapacity: block.totalCapacity,
      description: block.description || '',
      cells: block.cells || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (blockId) => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/blocks/${blockId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          showSuccess(data.msg || 'Block deleted successfully!');
          fetchBlocks();
        } else {
          const data = await response.json();
          showError(data.msg || 'Failed to delete block');
        }
      } catch (error) {
        console.error('Error deleting block:', error);
        showError('Network error. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Prison Blocks" subtitle="Manage prison blocks and facilities">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Prison Blocks" subtitle="Manage prison blocks and facilities">
      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaBuilding className="text-2xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Total Blocks: {blocks.length}</h3>
              <p className="text-gray-600">Active prison blocks in the system</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingBlock(null); setFormData({ name: '', blockCode: '', securityLevel: 'medium', totalCapacity: '', description: '', cells: '' }); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Add New Block
            </button>
          )}
        </div>
      </div>

      {/* Blocks Grid */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blocks.map((block) => (
            <div key={block._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{block.name}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    block.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {block.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Level:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      block.securityLevel === 'maximum' ? 'bg-red-100 text-red-800' :
                      block.securityLevel === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {block.securityLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{block.currentOccupancy || 0}/{block.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cells:</span>
                    <span className="font-medium">{block.cells ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Code:</span>
                    <span className="font-medium">{block.blockCode}</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${block.totalCapacity > 0 
                          ? Math.min(((block.currentOccupancy || 0) / block.totalCapacity) * 100, 100)
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(block)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(block._id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form (inline white section) */}
      {showForm && (
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{editingBlock ? 'Edit Block' : 'Add New Block'}</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBlock(null);
                  setFormData({ name: '', blockCode: '', securityLevel: 'medium', totalCapacity: '', description: '', cells: '' });
                }}
                className="inline-flex items-center text-indigo-600 hover:underline"
              >
                <FaArrowLeft className="mr-1" /> Back to list
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Block Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Block Code</label>
                <input
                  type="text"
                  value={formData.blockCode}
                  onChange={(e) => handleInputChange('blockCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.blockCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.blockCode && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.blockCode}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Level</label>
                <select
                  value={formData.securityLevel}
                  onChange={(e) => setFormData({ ...formData, securityLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="minimum">Minimum</option>
                  <option value="medium">Medium</option>
                  <option value="maximum">Maximum</option>
                  <option value="supermax">Supermax</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Capacity
                  {totalSystemCapacity > 0 && (
                    <span className="text-sm text-gray-500 ml-2">(System limit: {totalSystemCapacity})</span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.totalCapacity}
                  onChange={(e) => handleInputChange('totalCapacity', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.totalCapacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.totalCapacity && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.totalCapacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cells</label>
                <input
                  type="number"
                  value={formData.cells}
                  onChange={(e) => handleInputChange('cells', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.cells ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.cells && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.cells}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBlock(null);
                    setFormData({ name: '', securityLevel: 'medium', totalCapacity: '', description: '', cells: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editingBlock ? 'Update' : 'Create'} Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PrisonBlocks;

// File purpose: Admin page to list, create, edit, and delete prison blocks; shows capacity and security level.
// Frontend location: Route /admin/blocks (Admin > Prison Blocks) via App.jsx routing.
// Backend endpoints used: GET/POST/PUT/DELETE http://localhost:5000/api/admin/blocks.
// Auth: Requires Bearer token from sessionStorage.
// UI container: AdminLayout; inline form for add/edit with Tailwind styling.
