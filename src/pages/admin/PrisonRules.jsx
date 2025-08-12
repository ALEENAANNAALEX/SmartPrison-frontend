import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaShieldAlt, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const PrisonRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});
  const [selectedRule, setSelectedRule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    ruleNumber: '',
    severity: 'medium',
    consequences: [''],
    applicableBlocks: [],
    isActive: true
  });

  // Severity mapping for backend compatibility
  const severityMap = {
    low: 'minor',
    medium: 'major',
    high: 'critical'
  };
  const reverseSeverityMap = {
    minor: 'low',
    major: 'medium',
    critical: 'high'
  };

  useEffect(() => {
    fetchRules();
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

  const fetchRules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/rules/prison', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRules(data.rules);
        }
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFormErrors();

    // Validate required fields
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Please enter a title for the rule';
    }
    if (!formData.description.trim()) {
      errors.description = 'Please enter a description for the rule';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showMessage('error', 'Please fix the errors below');
      return;
    }

    try {
      const url = editingRule
        ? `http://localhost:5000/api/admin/rules/prison/${editingRule._id}`
        : 'http://localhost:5000/api/admin/rules/prison';
      const method = editingRule ? 'PUT' : 'POST';

      // Map consequences to rules array of objects as backend expects
      const rules = formData.consequences.filter(c => c.trim() !== '').map((consequence, index) => ({
        ruleNumber: formData.ruleNumber || `R${Date.now()}-${index + 1}`,
        ruleText: consequence,
        severity: severityMap[formData.severity] || 'minor',
        penalty: consequence
      }));

      const cleanedFormData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || 'general',
        ruleNumber: formData.ruleNumber.trim() || '',
        severity: formData.severity || 'medium',
        rules, // send rules array of objects
        applicableBlocks: formData.applicableBlocks || [],
        isActive: formData.isActive,
        createdAt: editingRule ? editingRule.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        },
        body: JSON.stringify(cleanedFormData)
      });

      if (response.ok) {
        const result = await response.json();
        fetchRules();
        setShowAddModal(false);
        setEditingRule(null);
        resetForm();
        showMessage('success', 'Rule saved successfully!');
      } else {
        let errorText = '';
        try {
          const errJson = await response.clone().json();
          errorText = errJson.message || JSON.stringify(errJson);
        } catch {
          try {
            errorText = await response.clone().text();
          } catch {
            errorText = 'Unknown server error';
          }
        }
        showMessage('error', `Error saving rule: ${response.status} ${response.statusText || ''} - ${errorText}`);
      }
    } catch (error) {
      showMessage('error', 'Network error saving rule: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      ruleNumber: '',
      severity: 'medium',
      consequences: [''],
      applicableBlocks: [],
      isActive: true
    });
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      title: rule.title,
      description: rule.description,
      category: rule.category || 'general',
      ruleNumber: rule.ruleNumber || '',
      // Map backend severity to UI value
      severity: reverseSeverityMap[rule.severity] || 'medium',
      // Map rules array to consequences for editing
      consequences: rule.rules && Array.isArray(rule.rules)
        ? rule.rules.map(r => r.ruleText)
        : [''],
      applicableBlocks: rule.applicableBlocks || [],
      isActive: rule.isActive !== false
    });
    setShowAddModal(true);
  };

  const handleDelete = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/rules/prison/${ruleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
          }
        });

        if (response.ok) {
          fetchRules();
          showMessage('success', 'Rule deleted successfully');
        } else {
          let errorText = '';
          try {
            const errJson = await response.clone().json();
            errorText = errJson.message || JSON.stringify(errJson);
          } catch {
            try {
              errorText = await response.clone().text();
            } catch {
              errorText = 'Unknown server error';
            }
          }
          showMessage('error', `Error deleting rule: ${response.status} ${response.statusText || ''} - ${errorText}`);
        }
      } catch (error) {
  
      }
    }
  };

  const addConsequence = () => {
    setFormData({
      ...formData,
      consequences: [...formData.consequences, '']
    });
  };

  const updateConsequence = (index, value) => {
    const newConsequences = [...formData.consequences];
    newConsequences[index] = value;
    setFormData({
      ...formData,
      consequences: newConsequences
    });
  };

  const removeConsequence = (index) => {
    const newConsequences = formData.consequences.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      consequences: newConsequences.length > 0 ? newConsequences : ['']
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Prison Rules" subtitle="Manage prison regulations and disciplinary rules">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Prison Rules" subtitle="Manage prison regulations and disciplinary rules">
      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaShieldAlt className="text-2xl text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Total Rules: {rules.length}</h3>
              <p className="text-gray-600">Active prison rules and regulations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Add a sample prison rule with all fields filled
                const sampleData = {
                  title: "Sample Prison Rule",
                  description: "This is a sample prison rule with all fields filled for testing",
                  category: "security",
                  ruleNumber: "PR001",
                  severity: "high",
                  consequences: ["Warning", "Loss of privileges", "Solitary confinement"],
                  applicableBlocks: ["Block A", "Block B"],
                  isActive: true
                };

                fetch('http://localhost:5000/api/admin/rules/prison', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer mock-token'
                  },
                  body: JSON.stringify(sampleData)
                })
                .then(response => response.json())
                .then(result => {
                  fetchRules();
                  showMessage('success', 'Sample prison rule with all fields added successfully!');
                })
                .catch(error => {
                  showMessage('error', 'Error adding sample prison rule');
                });
              }}
              className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Add Sample Rule
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Add New Rule
            </button>
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

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <div key={rule._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{rule.title}</h3>
                    {rule.ruleNumber && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                        #{rule.ruleNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{rule.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rule.severity === 'high' ? 'bg-red-100 text-red-800' :
                    rule.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rule.severity} severity
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Category: </span>
                    <span className="text-sm text-gray-600 capitalize">{rule.category}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Severity: </span>
                    <span className={`text-sm font-medium ${
                      rule.severity === 'high' ? 'text-red-600' :
                      rule.severity === 'medium' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                </div>

                {rule.ruleNumber && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Rule Number: </span>
                    <span className="text-sm text-gray-600 font-mono">#{rule.ruleNumber}</span>
                  </div>
                )}

                {rule.consequences && rule.consequences.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Consequences:</span>
                    <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                      {rule.consequences.slice(0, 2).map((consequence, index) => (
                        <li key={index}>{consequence}</li>
                      ))}
                      {rule.consequences.length > 2 && (
                        <li className="text-gray-400">... and {rule.consequences.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rule.applicableBlocks && rule.applicableBlocks.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Applicable Blocks: </span>
                    <span className="text-sm text-gray-600">{rule.applicableBlocks.join(', ')}</span>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Created: {new Date(rule.createdAt).toLocaleDateString()}
                  {rule.updatedAt && rule.updatedAt !== rule.createdAt && (
                    <span className="ml-2">• Updated: {new Date(rule.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setSelectedRule(rule)}
                  className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEye /> View
                </button>
                <button
                  onClick={() => handleEdit(rule)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
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
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRule ? 'Edit' : 'Add'} Prison Rule
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rule Number</label>
                  <input
                    type="text"
                    value={formData.ruleNumber}
                    onChange={(e) => setFormData({...formData, ruleNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., R001, 1.1"
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
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="general">General Conduct</option>
                    <option value="security">Security</option>
                    <option value="safety">Safety</option>
                    <option value="hygiene">Hygiene</option>
                    <option value="visitation">Visitation</option>
                    <option value="work">Work Programs</option>
                    <option value="education">Education</option>
                    <option value="medical">Medical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Consequences */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Consequences</label>
                  <button
                    type="button"
                    onClick={addConsequence}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    Add Consequence
                  </button>
                </div>
                {formData.consequences.map((consequence, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={consequence}
                      onChange={(e) => updateConsequence(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter consequence..."
                    />
                    {formData.consequences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeConsequence(index)}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Rule
                </label>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRule(null);
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
                  {editingRule ? 'Update' : 'Create'} Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Rule Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Prison Rule Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="text-gray-900">{selectedRule.title}</p>
                </div>
                {selectedRule.ruleNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rule Number</label>
                    <p className="text-gray-900 font-mono">#{selectedRule.ruleNumber}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRule.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900 capitalize">{selectedRule.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedRule.severity === 'high' ? 'bg-red-100 text-red-800' :
                    selectedRule.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedRule.severity}
                  </span>
                </div>
              </div>
              
              {selectedRule.consequences && selectedRule.consequences.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consequences</label>
                  <ul className="list-disc list-inside space-y-1 text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedRule.consequences.map((consequence, index) => (
                      <li key={index}>{consequence}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedRule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedRule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">{new Date(selectedRule.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setSelectedRule(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRule(null);
                  handleEdit(selectedRule);
                }}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Edit Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PrisonRules;
