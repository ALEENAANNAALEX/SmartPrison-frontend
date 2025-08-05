import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaUsers, FaEye } from 'react-icons/fa';

const PrisonBlocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    blockCode: '',
    securityLevel: 'medium',
    totalCapacity: '',
    description: '',
    floor: '',
    wing: ''
  });

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/blocks', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
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
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchBlocks();
        setShowAddModal(false);
        setEditingBlock(null);
        setFormData({
          name: '',
          blockCode: '',
          securityLevel: 'medium',
          totalCapacity: '',
          description: '',
          floor: '',
          wing: ''
        });
      }
    } catch (error) {
      console.error('Error saving block:', error);
    }
  };

  const handleEdit = (block) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      blockCode: block.blockCode,
      securityLevel: block.securityLevel,
      totalCapacity: block.totalCapacity,
      description: block.description || '',
      floor: block.floor || '',
      wing: block.wing || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (blockId) => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/blocks/${blockId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          fetchBlocks();
        }
      } catch (error) {
        console.error('Error deleting block:', error);
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
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add New Block
          </button>
        </div>
      </div>

      {/* Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blocks.map((block) => (
          <div key={block._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{block.name}</h3>
                  <p className="text-gray-600">Code: {block.blockCode}</p>
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
                  <span className="text-gray-600">Floor:</span>
                  <span className="font-medium">{block.floor || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wing:</span>
                  <span className="font-medium">{block.wing || 'N/A'}</span>
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingBlock ? 'Edit Block' : 'Add New Block'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Block Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Block Code</label>
                <input
                  type="text"
                  value={formData.blockCode}
                  onChange={(e) => setFormData({...formData, blockCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Level</label>
                <select
                  value={formData.securityLevel}
                  onChange={(e) => setFormData({...formData, securityLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="minimum">Minimum</option>
                  <option value="medium">Medium</option>
                  <option value="maximum">Maximum</option>
                  <option value="supermax">Supermax</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Capacity</label>
                <input
                  type="number"
                  value={formData.totalCapacity}
                  onChange={(e) => setFormData({...formData, totalCapacity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wing</label>
                  <input
                    type="text"
                    value={formData.wing}
                    onChange={(e) => setFormData({...formData, wing: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBlock(null);
                    setFormData({
                      name: '',
                      blockCode: '',
                      securityLevel: 'medium',
                      totalCapacity: '',
                      description: '',
                      floor: '',
                      wing: ''
                    });
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
