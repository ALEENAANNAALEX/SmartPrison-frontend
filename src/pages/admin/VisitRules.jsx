import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaCalendarCheck, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

const VisitRules = () => {
  const [visitRules, setVisitRules] = useState([]);
  const [paroleRules, setParoleRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visit');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});

  // Configuration: Use Supabase if available, otherwise use mock server
  const USE_SUPABASE = supabase !== null;
  const API_BASE_URL = USE_SUPABASE ? null : 'http://localhost:5000/api/admin';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    rules: '',
    restrictions: '',
    prohibitedItems: '',
    allowedVisitorTypes: '',
    visitingHours: {
      maxVisitsPerWeek: 2,
      maxVisitsPerMonth: 8,
      maxVisitDuration: 60,
      maxVisitorsPerSession: 3,
      minVisitorAge: 18
    },
    securityChecks: '',
    isActive: true
  });

  useEffect(() => {
    fetchVisitRules();
    fetchParoleRules();
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

  // Test API endpoint function
  const testAPIEndpoint = async () => {
    try {
      console.log('🧪 Testing API connection...');

      // Test authentication tokens
      const sessionToken = sessionStorage.getItem('token');
      const localToken = localStorage.getItem('token');
      console.log('Session token:', sessionToken ? 'Present' : 'Missing');
      console.log('Local token:', localToken ? 'Present' : 'Missing');

      const token = sessionToken || localToken;
      console.log('Using token:', token ? 'Real token found' : 'No token - need to login');

      if (!token) {
        alert('❌ No authentication token found. Please login first.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/rules/visits', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API Test - Status:', response.status);
      console.log('API Test - Content-Type:', response.headers.get('content-type'));

      if (response.ok) {
        const data = await response.json();
        console.log('API Test - Success:', data);
        console.log('📊 Current rules count:', data.rules?.length || 0);

        // Update the local state to show current rules
        if (data.success && data.rules) {
          setVisitRules(data.rules);
          alert(`✅ API Test Successful! Found ${data.rules.length} rules in database.`);
        }
      } else {
        const text = await response.text();
        console.log('API Test - Error:', text);
        alert(`❌ API Test Failed: ${response.status} - ${text}`);
      }
    } catch (error) {
      console.error('API Test - Network Error:', error);
      alert(`❌ Network Error: ${error.message}`);
    }
  };

  const fetchVisitRules = async () => {
    try {
      console.log('🔄 Fetching visit rules...');

      // Check authentication
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      console.log('🔑 Using token for fetch:', token ? 'real-token' : 'no-token');

      if (!token) {
        console.log('❌ No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/rules/visits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Response data:', data);
        if (data.success) {
          console.log('✅ Visit rules received:', data.rules.length, 'rules');
          console.log('📝 Rules details:', data.rules.map(r => ({ id: r._id, title: r.title })));
          setVisitRules(data.rules);
          console.log('🔄 State updated with', data.rules.length, 'rules');
        } else {
          console.log('❌ Response not successful:', data);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Response not ok:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching visit rules:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Fetch complete, loading set to false');
    }
  };

  const fetchParoleRules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/rules/parole', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setParoleRules(data.rules);
        }
      }
    } catch (error) {
      console.error('Error fetching parole rules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 FORM SUBMITTED');
    console.log('🚀 Current form data:', JSON.stringify(formData, null, 2));
    console.log('🚀 Editing rule:', editingRule);

    // Debug: Check each field
    console.log('📋 Form field analysis:');
    console.log('- Title:', formData.title);
    console.log('- Description:', formData.description);
    console.log('- Category:', formData.category);
    console.log('- Rules:', formData.rules);
    console.log('- Restrictions:', formData.restrictions);
    console.log('- Eligibility Criteria:', formData.eligibilityCriteria);
    console.log('- Prohibited Items:', formData.prohibitedItems);
    console.log('- Allowed Visitor Types:', formData.allowedVisitorTypes);
    console.log('- Special Conditions:', formData.specialConditions);
    console.log('- Security Checks:', formData.securityChecks);
    console.log('- Visiting Hours:', formData.visitingHours);
    console.log('- Is Active:', formData.isActive);

    // Simple validation
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    try {
      // Send all details as plain strings (no arrays or objects except visitingHours)
      const dataToSend = {
        title: formData.title ? String(formData.title).trim() : '',
        description: formData.description ? String(formData.description).trim() : '',
        category: formData.category ? String(formData.category).trim() : 'general',
        rules: formData.rules ? String(formData.rules).trim() : '',
        restrictions: formData.restrictions ? String(formData.restrictions).trim() : '',
        prohibitedItems: formData.prohibitedItems ? String(formData.prohibitedItems).trim() : '',
        allowedVisitorTypes: formData.allowedVisitorTypes ? String(formData.allowedVisitorTypes).trim() : '',
        securityChecks: formData.securityChecks ? String(formData.securityChecks).trim() : '',
        visitingHours: {
          maxVisitsPerWeek: formData.visitingHours.maxVisitsPerWeek || 2,
          maxVisitsPerMonth: formData.visitingHours.maxVisitsPerMonth || 8,
          maxVisitDuration: formData.visitingHours.maxVisitDuration || 60,
          maxVisitorsPerSession: formData.visitingHours.maxVisitorsPerSession || 3,
          minVisitorAge: formData.visitingHours.minVisitorAge || 18
        },
        isActive: formData.isActive,
        updatedAt: new Date().toISOString()
      };
      if (!editingRule) {
        dataToSend.createdAt = new Date().toISOString();
      }

      console.log('🚀 Data to send:', JSON.stringify(dataToSend, null, 2));

      const url = editingRule
        ? `http://localhost:5000/api/admin/rules/visits/${editingRule._id}`
        : 'http://localhost:5000/api/admin/rules/visits';

      const response = await fetch(url, {
        method: editingRule ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        setShowAddModal(false);
        setEditingRule(null);
        fetchVisitRules();
        showMessage('success', 'Rule saved successfully with all fields!');
      } else {
        let errorData;
        try {
          errorData = await response.clone().json();
        } catch {
          errorData = await response.clone().text();
        }
        showMessage('error', 'Error: ' + (errorData.message || JSON.stringify(errorData)));
      }
    } catch (error) {
      showMessage('error', 'Network error: ' + error.message);
    }
  };

  const resetForm = () => {
    console.log('🔄 Resetting form to default values');
    const defaultFormData = {
      title: '',
      description: '',
      category: 'general',
      rules: '',
      restrictions: '',
      prohibitedItems: '',
      allowedVisitorTypes: '',
      securityChecks: '',
      visitingHours: {
        maxVisitsPerWeek: 2,
        maxVisitsPerMonth: 8,
        maxVisitDuration: 60,
        maxVisitorsPerSession: 3,
        minVisitorAge: 18
      },
      isActive: true
    };
    setFormData(defaultFormData);
    console.log('🔄 Form reset complete:', defaultFormData);
    clearFormErrors();
  };

  const handleEdit = (rule) => {
    console.log('🔧 EDIT CLICKED - Rule:', rule);
    setEditingRule(rule);

    // Helper to join array or fallback to string
    const joinField = (field) => Array.isArray(field) ? field.join(', ') : (field || '');

    const newFormData = {
      title: rule.title || '',
      description: rule.description || '',
      category: rule.category || 'general',
      rules: joinField(rule.rules),
      restrictions: joinField(rule.restrictions),
      prohibitedItems: joinField(rule.prohibitedItems),
      allowedVisitorTypes: joinField(rule.allowedVisitorTypes),
      securityChecks: joinField(rule.securityChecks),
      visitingHours: rule.visitingHours ? {
        maxVisitsPerWeek: rule.visitingHours.maxVisitsPerWeek || 2,
        maxVisitsPerMonth: rule.visitingHours.maxVisitsPerMonth || 8,
        maxVisitDuration: rule.visitingHours.maxVisitDuration || 60,
        maxVisitorsPerSession: rule.visitingHours.maxVisitorsPerSession || 3,
        minVisitorAge: rule.visitingHours.minVisitorAge || 18
      } : {
        maxVisitsPerWeek: 2,
        maxVisitsPerMonth: 8,
        maxVisitDuration: 60,
        maxVisitorsPerSession: 3,
        minVisitorAge: 18
      },
      isActive: rule.isActive !== undefined ? rule.isActive : true
    };

    console.log('🔧 SETTING FORM DATA:', newFormData);
    setFormData(newFormData);
    setShowAddModal(true);
    clearFormErrors();
    setMessage({ type: '', text: '' });
  };

  const handleDelete = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        const endpoint = activeTab === 'visit' ? 'visits' : 'parole';
        const response = await fetch(`http://localhost:5000/api/admin/rules/${endpoint}/${ruleId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
          }
        });

        if (response.ok) {
          if (activeTab === 'visit') {
            fetchVisitRules();
          } else {
            fetchParoleRules();
          }
        }
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const addArrayField = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const updateArrayField = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray
    });
  };

  const removeArrayField = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      [field]: newArray.length > 0 ? newArray : ['']
    });
  };

  const currentRules = activeTab === 'visit' ? visitRules : paroleRules;

  if (loading) {
    return (
      <AdminLayout title="Visit & Parole Rules" subtitle="Manage visiting and parole regulations">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Visit & Parole Rules" subtitle="Manage visiting and parole regulations">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('visit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'visit'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visit Rules ({visitRules.length})
            </button>
            <button
              onClick={() => setActiveTab('parole')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'parole'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Parole Rules ({paroleRules.length})
            </button>
          </nav>
        </div>

        {/* Action Bar */}
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaCalendarCheck className="text-2xl text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'visit' ? 'Visit Rules' : 'Parole Rules'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'visit' 
                    ? 'Manage visiting regulations and policies' 
                    : 'Manage parole eligibility and conditions'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Add a sample rule with all fields filled
                  const sampleData = {
                    title: "Sample Complete Rule",
                    description: "This is a sample rule with all fields filled for testing",
                    category: "family",
                    rules: ["Sample rule 1", "Sample rule 2"],
                    restrictions: ["No food items", "No electronic devices"],
                    eligibilityCriteria: ["Good behavior", "Completed orientation"],
                    prohibitedItems: ["Weapons", "Drugs", "Cell phones"],
                    allowedVisitorTypes: ["Family", "Legal counsel"],
                    specialConditions: ["Supervised visits only", "ID required"],
                    securityChecks: ["Metal detector", "Bag search"],
                    visitingHours: {
                      maxVisitsPerWeek: 3,
                      maxVisitsPerMonth: 12,
                      maxVisitDuration: 90,
                      maxVisitorsPerSession: 4,
                      minVisitorAge: 16
                    },
                    isActive: true
                  };

                  fetch('http://localhost:5000/api/admin/rules/visits', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer mock-token'
                    },
                    body: JSON.stringify(sampleData)
                  })
                  .then(response => response.json())
                  .then(result => {
                    console.log('Sample rule added:', result);
                    fetchVisitRules();
                    alert('Sample rule with all fields added successfully!');
                  })
                  .catch(error => {
                    console.error('Error adding sample rule:', error);
                    alert('Error adding sample rule');
                  });
                }}
                className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Add Sample Rule
              </button>
              <button
                onClick={() => {
                  setShowAddModal(true);
                  clearFormErrors();
                  setMessage({ type: '', text: '' });
                }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Add {activeTab === 'visit' ? 'Visit' : 'Parole'} Rule
              </button>
            </div>
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
        {currentRules.map((rule) => (
          <div key={rule._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{rule.title}</h3>
                  <p className="text-gray-600 mt-1">{rule.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-4">
                {rule.rules && rule.rules.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Rules:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {rule.rules.slice(0, 3).map((r, index) => (
                        <li key={index}>{r}</li>
                      ))}
                      {rule.rules.length > 3 && (
                        <li className="text-gray-400">... and {rule.rules.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rule.restrictions && rule.restrictions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Restrictions:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {rule.restrictions.slice(0, 2).map((r, index) => (
                        <li key={index}>{r}</li>
                      ))}
                      {rule.restrictions.length > 2 && (
                        <li className="text-gray-400">... and {rule.restrictions.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rule.prohibitedItems && rule.prohibitedItems.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Prohibited Items:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {rule.prohibitedItems.slice(0, 2).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                      {rule.prohibitedItems.length > 2 && (
                        <li className="text-gray-400">... and {rule.prohibitedItems.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rule.allowedVisitorTypes && rule.allowedVisitorTypes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Allowed Visitors:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {rule.allowedVisitorTypes.slice(0, 2).map((type, index) => (
                        <li key={index}>{type}</li>
                      ))}
                      {rule.allowedVisitorTypes.length > 2 && (
                        <li className="text-gray-400">... and {rule.allowedVisitorTypes.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rule.eligibilityCriteria && rule.eligibilityCriteria.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Eligibility Criteria:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {rule.eligibilityCriteria.slice(0, 2).map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                      ))}
                      {rule.eligibilityCriteria.length > 2 && (
                        <li className="text-gray-400">... and {rule.eligibilityCriteria.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rule.specialConditions && rule.specialConditions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Special Conditions:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {rule.specialConditions.slice(0, 2).map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                      {rule.specialConditions.length > 2 && (
                        <li className="text-gray-400">... and {rule.specialConditions.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rule.securityChecks && rule.securityChecks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Security Checks:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {rule.securityChecks.slice(0, 2).map((check, index) => (
                        <li key={index}>{check}</li>
                      ))}
                      {rule.securityChecks.length > 2 && (
                        <li className="text-gray-400">... and {rule.securityChecks.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {rule.visitingHours && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Visiting Hours Configuration:</h4>
                    <div className="text-sm text-gray-600 grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
                      <span>Max visits/week: <strong>{rule.visitingHours.maxVisitsPerWeek}</strong></span>
                      <span>Max visits/month: <strong>{rule.visitingHours.maxVisitsPerMonth}</strong></span>
                      <span>Max duration: <strong>{rule.visitingHours.maxVisitDuration} min</strong></span>
                      <span>Max visitors: <strong>{rule.visitingHours.maxVisitorsPerSession}</strong></span>
                      <span className="col-span-2">Min visitor age: <strong>{rule.visitingHours.minVisitorAge} years</strong></span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-200">
                  <span>Category: <strong>{rule.category}</strong></span>
                  <div className="text-right">
                    <div>Created: {new Date(rule.createdAt).toLocaleDateString()}</div>
                    {rule.updatedAt && rule.updatedAt !== rule.createdAt && (
                      <div>Updated: {new Date(rule.updatedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
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
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingRule ? 'Edit' : 'Add'} {activeTab === 'visit' ? 'Visit' : 'Parole'} Rule
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Debug info */}
              <div className="bg-gray-100 p-2 rounded text-xs">
                <strong>Debug:</strong> Title: "{formData.title}", Editing: {editingRule ? editingRule._id : 'None'}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      console.log('Title changed to:', e.target.value);
                      setFormData({...formData, title: e.target.value});
                      if (formErrors.title) {
                        setFormErrors({...formErrors, title: ''});
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter rule title..."
                    required
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="security">Security</option>
                    <option value="family">Family Visits</option>
                    <option value="legal">Legal Visits</option>
                    <option value="medical">Medical</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({...formData, description: e.target.value});
                    if (formErrors.description) {
                      setFormErrors({...formErrors, description: ''});
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  rows="3"
                  required
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rules</label>
                <input
                  type="text"
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter rule..."
                />
              </div>

              {/* Restrictions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restrictions</label>
                <input
                  type="text"
                  value={formData.restrictions}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter restriction..."
                />
              </div>


              {/* Prohibited Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prohibited Items</label>
                <input
                  type="text"
                  value={formData.prohibitedItems}
                  onChange={(e) => setFormData({ ...formData, prohibitedItems: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter prohibited items..."
                />
                {formErrors.prohibitedItems && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.prohibitedItems}</p>
                )}
              </div>

              {/* Allowed Visitor Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Visitor Types</label>
                <input
                  type="text"
                  value={formData.allowedVisitorTypes}
                  onChange={(e) => setFormData({ ...formData, allowedVisitorTypes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter visitor types (e.g., Family, Legal, Friend)..."
                />
                {formErrors.allowedVisitorTypes && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.allowedVisitorTypes}</p>
                )}
              </div>


              {/* Security Checks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Security Checks</label>
                <input
                  type="text"
                  value={formData.securityChecks}
                  onChange={(e) => setFormData({ ...formData, securityChecks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter security checks..."
                />
                {formErrors.securityChecks && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.securityChecks}</p>
                )}
              </div>

              {/* Visiting Hours Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Visiting Hours Configuration</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Visits Per Week</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={formData.visitingHours.maxVisitsPerWeek}
                      onChange={(e) => setFormData({
                        ...formData,
                        visitingHours: {
                          ...formData.visitingHours,
                          maxVisitsPerWeek: parseInt(e.target.value) || 1
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.maxVisitsPerWeek ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.maxVisitsPerWeek && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.maxVisitsPerWeek}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Visits Per Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.visitingHours.maxVisitsPerMonth}
                      onChange={(e) => setFormData({
                        ...formData,
                        visitingHours: {
                          ...formData.visitingHours,
                          maxVisitsPerMonth: parseInt(e.target.value) || 1
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.maxVisitsPerMonth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.maxVisitsPerMonth && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.maxVisitsPerMonth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Visit Duration (minutes)</label>
                    <input
                      type="number"
                      min="15"
                      max="180"
                      value={formData.visitingHours.maxVisitDuration}
                      onChange={(e) => setFormData({
                        ...formData,
                        visitingHours: {
                          ...formData.visitingHours,
                          maxVisitDuration: parseInt(e.target.value) || 15
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.maxVisitDuration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.maxVisitDuration && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.maxVisitDuration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Visitors Per Session</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.visitingHours.maxVisitorsPerSession}
                      onChange={(e) => setFormData({
                        ...formData,
                        visitingHours: {
                          ...formData.visitingHours,
                          maxVisitorsPerSession: parseInt(e.target.value) || 1
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.maxVisitorsPerSession ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.maxVisitorsPerSession && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.maxVisitorsPerSession}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Minimum Visitor Age</label>
                    <input
                      type="number"
                      min="0"
                      max="21"
                      value={formData.visitingHours.minVisitorAge}
                      onChange={(e) => setFormData({
                        ...formData,
                        visitingHours: {
                          ...formData.visitingHours,
                          minVisitorAge: parseInt(e.target.value) || 0
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.minVisitorAge ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.minVisitorAge && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.minVisitorAge}</p>
                    )}
                  </div>
                </div>
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
                    setMessage({ type: '', text: '' });
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
    </AdminLayout>
  );
};

export default VisitRules;
