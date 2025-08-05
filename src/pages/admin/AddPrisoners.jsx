import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';

const AddPrisoners = () => {
  const [prisoners, setPrisoners] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrisoner, setEditingPrisoner] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [filterSecurity, setFilterSecurity] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 'male',
    prisonerNumber: '',
    currentBlock: '',
    securityLevel: 'medium',
    charges: '',
    sentenceLength: '',
    admissionDate: '',
    cellNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    fetchPrisoners();
    fetchBlocks();
  }, []);

  // Function to show messages
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Function to clear form errors
  const clearFormErrors = () => {
    setFormErrors({});
  };

  const fetchPrisoners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/prisoners', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrisoners(data.prisoners);
        }
      }
    } catch (error) {
      console.error('Error fetching prisoners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/blocks', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFormErrors();

    // Validate required fields
    const errors = {};
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.prisonerNumber.trim()) {
      errors.prisonerNumber = 'Prisoner number is required';
    }
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.currentBlock) {
      errors.currentBlock = 'Block assignment is required';
    }
    if (!formData.charges.trim()) {
      errors.charges = 'Charges are required';
    }
    if (!formData.admissionDate) {
      errors.admissionDate = 'Admission date is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMessage('error', 'Please fix the errors below');
      return;
    }

    try {
      const url = editingPrisoner
        ? `http://localhost:5000/api/admin/prisoners/${editingPrisoner._id}`
        : 'http://localhost:5000/api/admin/prisoners';

      const method = editingPrisoner ? 'PUT' : 'POST';

      console.log('Submitting prisoner data:', formData); // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        const result = await response.json();
        console.log('Prisoner saved successfully:', result); // Debug log
        fetchPrisoners();
        setShowAddModal(false);
        setEditingPrisoner(null);
        resetForm();
        showMessage('success', `Prisoner ${editingPrisoner ? 'updated' : 'added'} successfully!`);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        showMessage('error', 'Error saving prisoner: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving prisoner:', error);
      if (error.message.includes('fetch')) {
        showMessage('error', 'Cannot connect to server. Please make sure the backend server is running on localhost:5001');
      } else {
        showMessage('error', 'Error saving prisoner: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: 'male',
      prisonerNumber: '',
      currentBlock: '',
      securityLevel: 'medium',
      charges: '',
      sentenceLength: '',
      admissionDate: '',
      cellNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    });
    clearFormErrors();
  };

  const handleEdit = (prisoner) => {
    setEditingPrisoner(prisoner);
    setFormData({
      firstName: prisoner.firstName,
      lastName: prisoner.lastName,
      middleName: prisoner.middleName || '',
      dateOfBirth: prisoner.dateOfBirth ? new Date(prisoner.dateOfBirth).toISOString().split('T')[0] : '',
      gender: prisoner.gender,
      prisonerNumber: prisoner.prisonerNumber,
      currentBlock: prisoner.currentBlock?._id || '',
      securityLevel: prisoner.securityLevel,
      charges: prisoner.charges?.[0]?.charge || '',
      sentenceLength: prisoner.sentenceDetails?.sentenceLength || '',
      admissionDate: prisoner.admissionDate ? new Date(prisoner.admissionDate).toISOString().split('T')[0] : '',
      cellNumber: prisoner.cellNumber || '',
      address: {
        street: prisoner.address?.street || '',
        city: prisoner.address?.city || '',
        state: prisoner.address?.state || '',
        pincode: prisoner.address?.pincode || ''
      },
      emergencyContact: {
        name: prisoner.emergencyContact?.name || '',
        relationship: prisoner.emergencyContact?.relationship || '',
        phone: prisoner.emergencyContact?.phone || ''
      }
    });
    setShowAddModal(true);
    clearFormErrors();
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (prisonerId) => {
    if (window.confirm('Are you sure you want to delete this prisoner?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/prisoners/${prisonerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
          }
        });

        if (response.ok) {
          fetchPrisoners();
        }
      } catch (error) {
        console.error('Error deleting prisoner:', error);
      }
    }
  };

  // Filter prisoners based on search and filters
  const filteredPrisoners = prisoners.filter(prisoner => {
    const matchesSearch = searchTerm === '' || 
      prisoner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prisoner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prisoner.prisonerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBlock = filterBlock === '' || prisoner.currentBlock?._id === filterBlock;
    const matchesSecurity = filterSecurity === '' || prisoner.securityLevel === filterSecurity;
    
    return matchesSearch && matchesBlock && matchesSecurity;
  });

  if (loading) {
    return (
      <AdminLayout title="Prisoner Management" subtitle="Add and manage prisoners">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Prisoner Management" subtitle="Add and manage prisoners">
      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUserShield className="text-2xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Total Prisoners: {prisoners.length}</h3>
              <p className="text-gray-600">Active prisoners in the system</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Add a sample prisoner with all fields filled
                const sampleData = {
                  firstName: "John",
                  lastName: "Doe",
                  middleName: "Michael",
                  dateOfBirth: "1985-05-15",
                  gender: "male",
                  prisonerNumber: "P" + Date.now().toString().slice(-6),
                  currentBlock: "Block A",
                  securityLevel: "medium",
                  charges: "Theft, Burglary",
                  sentenceLength: "5 years",
                  admissionDate: "2024-01-15",
                  cellNumber: "A101",
                  address: {
                    street: "123 Main Street",
                    city: "Springfield",
                    state: "Illinois",
                    pincode: "62701"
                  },
                  emergencyContact: {
                    name: "Jane Doe",
                    relationship: "Sister",
                    phone: "555-0123"
                  }
                };

                fetch('http://localhost:5000/api/admin/prisoners', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                  },
                  body: JSON.stringify(sampleData)
                })
                .then(response => response.json())
                .then(result => {
                  console.log('Sample prisoner added:', result);
                  fetchPrisoners();
                  showMessage('success', 'Sample prisoner with all fields added successfully!');
                })
                .catch(error => {
                  console.error('Error adding sample prisoner:', error);
                  showMessage('error', 'Error adding sample prisoner');
                });
              }}
              className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Add Sample Prisoner
            </button>
            <button
              onClick={() => {
                setShowAddModal(true);
                clearFormErrors();
                setMessage({ type: '', text: '' });
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Add New Prisoner
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search prisoners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Blocks</option>
            {blocks.map((block) => (
              <option key={block._id} value={block._id}>{block.name}</option>
            ))}
          </select>
          
          <select
            value={filterSecurity}
            onChange={(e) => setFilterSecurity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Security Levels</option>
            <option value="minimum">Minimum</option>
            <option value="medium">Medium</option>
            <option value="maximum">Maximum</option>
            <option value="supermax">Supermax</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredPrisoners.length} of {prisoners.length} prisoners
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message.type === 'success' ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  message.type === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prisoners Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prisoner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prisoner #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cell</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrisoners.map((prisoner) => (
                <tr key={prisoner._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUserShield className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {prisoner.firstName} {prisoner.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prisoner.gender} • {new Date().getFullYear() - new Date(prisoner.dateOfBirth).getFullYear()} years
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {prisoner.prisonerNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prisoner.currentBlock?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prisoner.cellNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prisoner.securityLevel === 'maximum' ? 'bg-red-100 text-red-800' :
                      prisoner.securityLevel === 'medium' ? 'bg-orange-100 text-orange-800' :
                      prisoner.securityLevel === 'supermax' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {prisoner.securityLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(prisoner.admissionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prisoner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {prisoner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(prisoner)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(prisoner._id)}
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPrisoner ? 'Edit Prisoner' : 'Add New Prisoner'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({...formData, firstName: e.target.value});
                        if (formErrors.firstName) {
                          setFormErrors({...formErrors, firstName: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({...formData, lastName: e.target.value});
                        if (formErrors.lastName) {
                          setFormErrors({...formErrors, lastName: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prisoner Number</label>
                    <input
                      type="text"
                      value={formData.prisonerNumber}
                      onChange={(e) => setFormData({...formData, prisonerNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Prison Assignment */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Prison Assignment</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                    <select
                      value={formData.currentBlock}
                      onChange={(e) => setFormData({...formData, currentBlock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Block</option>
                      {blocks.map((block) => (
                        <option key={block._id} value={block._id}>
                          {block.name} ({block.blockCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cell Number</label>
                    <input
                      type="text"
                      value={formData.cellNumber}
                      onChange={(e) => setFormData({...formData, cellNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Charge</label>
                    <input
                      type="text"
                      value={formData.charges}
                      onChange={(e) => setFormData({...formData, charges: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Theft, Assault, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sentence Length (months)</label>
                    <input
                      type="number"
                      value={formData.sentenceLength}
                      onChange={(e) => setFormData({...formData, sentenceLength: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Address</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                    <input
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, name: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                    <input
                      type="text"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, relationship: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Father, Mother, Spouse"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phone: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPrisoner(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editingPrisoner ? 'Update' : 'Create'} Prisoner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AddPrisoners;
