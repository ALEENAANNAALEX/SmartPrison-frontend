import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaPlus,
  FaUserCheck,
  FaUserTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaExclamationTriangle,
  FaArrowLeft
} from 'react-icons/fa';

const InmatesManagement = () => {
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInmate, setEditingInmate] = useState(null);

  // Admin-like add form states
  const [blocks, setBlocks] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [fullName, setFullName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [prisonerForm, setPrisonerForm] = useState({
    prisonerNumber: '',
    dateOfBirth: '',
    gender: 'male',
    currentBlock: '', // stores block _id
    cellNumber: '',
    admissionDate: '',
    securityLevel: 'medium',
    charges: '',
    sentenceLength: '',
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

  // Validation helpers reused from Admin AddPrisoners
  const today = new Date();
  const calculateAge = (isoDate) => {
    if (!isoDate) return 0;
    const dob = new Date(isoDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };
  const validateDob = (isoDate) => {
    if (!isoDate) return 'Date of birth is required';
    if (calculateAge(isoDate) < 18) return 'User must be at least 18 years old';
    return '';
  };
  const toInputDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayLocal = new Date();
  const sixMonthsBack = new Date(todayLocal);
  sixMonthsBack.setMonth(sixMonthsBack.getMonth() - 6);
  const sixMonthsForward = new Date(todayLocal);
  sixMonthsForward.setMonth(sixMonthsForward.getMonth() + 6);
  const minAdmissionInput = toInputDate(sixMonthsBack);
  const maxAdmissionInput = toInputDate(sixMonthsForward);
  const validateAdmissionDate = (isoDate) => {
    if (!isoDate) return 'Admission date is required';
    const d = new Date(isoDate);
    if (d < sixMonthsBack || d > sixMonthsForward) {
      return 'Admission date must be within the last 6 months and not in the far future';
    }
    return '';
  };

  // Date helpers for validation (same logic as Admin)
  // NOTE: consolidated in the section above to avoid duplication

  // Removed mockInmates; data now comes from backend /api/warden/inmates

  useEffect(() => {
    fetchInmates();
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/blocks', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) setBlocks(data.blocks || []);
      }
    } catch (e) {
      console.error('Error fetching blocks', e);
    }
  };

  const fetchInmates = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/warden/inmates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.inmates)) {
          // Map backend inmates to UI shape
          const mapped = data.inmates.map((p, idx) => ({
            id: p._id || p.id || idx,
            inmateId: p.prisonerNumber || p.inmateId || p.prisonerId || 'N/A',
            name: p.fullName || [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || p.name || 'Unknown',
            age: p.age ?? '',
            gender: (p.gender || '').toString().replace(/^./, c => c.toUpperCase()),
            photoUrl: p.photograph ? (p.photograph.startsWith('http') ? p.photograph : `http://localhost:5000${p.photograph}`) : '',
            block: p.currentBlock?.name || p.blockName || 'Unknown Block',
            cell: p.cellNumber || p.currentCell || '—',
            status: (p.status || 'active').toString().replace(/^./, c => c.toUpperCase()),
            crime: Array.isArray(p.charges) ? (p.charges[0]?.charge || '') : (p.crime || p.offense || p.charges || ''),
            charges: Array.isArray(p.charges) ? p.charges : [],
            sentence: p.sentence || (p.sentenceDetails?.sentenceLength ? `${p.sentenceDetails.sentenceLength} months` : ''),
            sentenceType: p.sentenceDetails?.sentenceType || '',
            admissionDate: p.admissionDate || p.sentenceDetails?.startDate || p.admittedAt || '',
            releaseDate: (() => {
              if (p.sentenceDetails?.expectedReleaseDate) return p.sentenceDetails.expectedReleaseDate;
              const months = Number(p.sentenceDetails?.sentenceLength ?? p.sentenceLength);
              const start = p.sentenceDetails?.startDate || p.admissionDate || p.admittedAt;
              if (months && start) {
                const d = new Date(start);
                const day = d.getDate();
                d.setMonth(d.getMonth() + months);
                if (d.getDate() < day) d.setDate(0);
                return d.toISOString();
              }
              return '';
            })(),
            paroleEligibilityDate: p.sentenceDetails?.paroleEligibilityDate || '',
            behavior: p.behavior || p.behaviorLevel || 'Average',
            healthStatus: p.healthStatus || 'Healthy',
            nationality: p.nationality || '',
            dateOfBirth: p.dateOfBirth || '',
            height: p.height || '',
            weight: p.weight || '',
            eyeColor: p.eyeColor || '',
            hairColor: p.hairColor || '',
            distinguishingMarks: Array.isArray(p.distinguishingMarks) ? p.distinguishingMarks : [],
            address: {
              street: p.address?.street || (typeof p.address === 'string' ? p.address : ''),
              city: p.address?.city || '',
              state: p.address?.state || '',
              pincode: p.address?.pincode || '',
              country: p.address?.country || ''
            },
            emergencyContact: {
              name: p.emergencyContact?.name || '',
              relationship: p.emergencyContact?.relationship || '',
              phone: p.emergencyContact?.phone || '',
              address: p.emergencyContact?.address || ''
            },
            securityLevel: p.securityLevel || '',
            riskLevel: p.riskLevel || '',
            medicalInfo: {
              bloodGroup: p.medicalInfo?.bloodGroup || '',
              allergies: p.medicalInfo?.allergies || [],
              chronicConditions: p.medicalInfo?.chronicConditions || [],
              medications: p.medicalInfo?.medications || [],
              lastCheckup: p.medicalInfo?.lastCheckup || '',
              medicalNotes: p.medicalInfo?.medicalNotes || ''
            }
          }));
          setInmates(mapped);
        } else {
          setInmates([]);
        }
      } else {
        setInmates([]);
      }
    } catch (e) {
      console.error('Failed to load inmates', e);
      setInmates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInmate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token';

      // Build FormData like Admin single-add flow
      const fd = new FormData();

      // Derive first/last name from fullName state
      const nameTrim = (fullName || '').trim();
      const parts = nameTrim.split(/\s+/);
      const firstName = parts.shift() || '';
      const lastName = parts.join(' ');

      fd.append('prisonerNumber', prisonerForm.prisonerNumber?.trim());
      fd.append('firstName', firstName);
      fd.append('lastName', lastName);
      if (prisonerForm.dateOfBirth) fd.append('dateOfBirth', prisonerForm.dateOfBirth);
      if (prisonerForm.gender) fd.append('gender', prisonerForm.gender);
      if (prisonerForm.currentBlock) fd.append('currentBlock', prisonerForm.currentBlock);
      if (prisonerForm.cellNumber?.trim()) fd.append('cellNumber', prisonerForm.cellNumber.trim());
      if (prisonerForm.admissionDate) fd.append('admissionDate', prisonerForm.admissionDate);
      if (prisonerForm.securityLevel) fd.append('securityLevel', prisonerForm.securityLevel);
      if (prisonerForm.charges) fd.append('charges', prisonerForm.charges);
      if (prisonerForm.sentenceLength) {
        fd.append('sentenceDetails', JSON.stringify({ sentenceLength: Number(prisonerForm.sentenceLength) }));
      }
      if (prisonerForm.address) {
        const composedAddress = {
          street: prisonerForm.address.street?.trim() || '',
          city: prisonerForm.address.city || '',
          state: prisonerForm.address.state || '',
          pincode: prisonerForm.address.pincode || ''
        };
        fd.append('address', JSON.stringify(composedAddress));
      }
      if (prisonerForm.emergencyContact) {
        fd.append('emergencyContact', JSON.stringify(prisonerForm.emergencyContact));
      }
      if (photoFile) fd.append('photograph', photoFile);

      const response = await fetch('http://localhost:5000/api/admin/prisoners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: fd
      });

      if (response.ok) {
        const result = await response.json();
        setNotification({ type: 'success', message: '✅ Prisoner added successfully!' });
        // Refresh list to reflect new prisoner
        fetchInmates();
        // Reset form fields similar to Admin resetForm
        setPrisonerForm({
          prisonerNumber: '',
          dateOfBirth: '',
          gender: 'male',
          currentBlock: '',
          cellNumber: '',
          admissionDate: '',
          securityLevel: 'medium',
          charges: '',
          sentenceLength: '',
          address: { street: '', city: '', state: '', pincode: '' },
          emergencyContact: { name: '', relationship: '', phone: '' }
        });
        setFullName('');
        setPhotoFile(null);
        setShowForm(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setNotification({ type: 'error', message: '❌ Failed to add prisoner: ' + (errorData.message || 'Unknown error') });
      }

      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Add inmate error:', error);
      setNotification({ type: 'error', message: '❌ Failed to add prisoner. Please try again.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredInmates = inmates.filter(inmate => {
    const matchesSearch = inmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inmate.inmateId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inmate.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800',
      'Isolation': 'bg-red-100 text-red-800',
      'Medical': 'bg-yellow-100 text-yellow-800',
      'Released': 'bg-gray-100 text-gray-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getBehaviorBadge = (behavior) => {
    const behaviorColors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${behaviorColors[behavior] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <WardenLayout title="Inmates Management" subtitle="Manage and monitor all inmates">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Inmates Management" subtitle="Manage and monitor all inmates">
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
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => {
                    setNotification(null);
                    const el = document.getElementById('inmates-list');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                >
                  Go to List
                </button>
                <button
                  onClick={() => setNotification(null)}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                >
                  Close
                </button>
              </div>
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
        {/* Header Actions */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${showForm ? 'hidden' : ''}`}>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search inmates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="isolation">Isolation</option>
              <option value="medical">Medical</option>
              <option value="released">Released</option>
            </select>
            

          </div>
          
        </div>

        {/* Inline Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{editingInmate ? 'Edit Inmate' : 'Add New Inmate'}</h3>
              <button
                onClick={() => { setShowForm(false); setEditingInmate(null); }}
                className="inline-flex items-center text-indigo-600 hover:underline"
              >
                <FaArrowLeft className="mr-1" /> Back to list
              </button>
            </div>

            <form onSubmit={handleSubmitInmate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {formErrors.fullName && <p className="text-sm text-red-600 mt-1">{formErrors.fullName}</p>}
                </div>

                {/* Prisoner Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prisoner Number</label>
                  <input
                    type="text"
                    value={prisonerForm.prisonerNumber}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, prisonerNumber: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {formErrors.prisonerNumber && <p className="text-sm text-red-600 mt-1">{formErrors.prisonerNumber}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={prisonerForm.dateOfBirth}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, dateOfBirth: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    max={maxAdmissionInput}
                    required
                  />
                  {formErrors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{formErrors.dateOfBirth}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={prisonerForm.gender}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, gender: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Block (from API) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Block</label>
                  <select
                    value={prisonerForm.currentBlock}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, currentBlock: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select a block</option>
                    {blocks.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                  {formErrors.currentBlock && <p className="text-sm text-red-600 mt-1">{formErrors.currentBlock}</p>}
                </div>

                {/* Cell Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cell Number</label>
                  <input
                    type="text"
                    value={prisonerForm.cellNumber}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, cellNumber: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Charges */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Charges</label>
                  <input
                    type="text"
                    value={prisonerForm.charges}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, charges: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {formErrors.charges && <p className="text-sm text-red-600 mt-1">{formErrors.charges}</p>}
                </div>

                {/* Sentence Length (months) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sentence Length (months)</label>
                  <input
                    type="number"
                    value={prisonerForm.sentenceLength}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, sentenceLength: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Admission Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admission Date</label>
                  <input
                    type="date"
                    value={prisonerForm.admissionDate}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, admissionDate: e.target.value })}
                    min={minAdmissionInput}
                    max={maxAdmissionInput}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {formErrors.admissionDate && <p className="text-sm text-red-600 mt-1">{formErrors.admissionDate}</p>}
                </div>

                {/* Security Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Security Level</label>
                  <select
                    value={prisonerForm.securityLevel}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, securityLevel: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Address Street */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address (Street)</label>
                  <input
                    type="text"
                    value={prisonerForm.address.street}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, address: { ...prisonerForm.address, street: e.target.value } })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={prisonerForm.emergencyContact.name}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, emergencyContact: { ...prisonerForm.emergencyContact, name: e.target.value } })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                  <input
                    type="text"
                    value={prisonerForm.emergencyContact.phone}
                    onChange={(e) => setPrisonerForm({ ...prisonerForm, emergencyContact: { ...prisonerForm.emergencyContact, phone: e.target.value } })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Photo Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Photograph</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingInmate(null); }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Back to list
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Create Prisoner'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Statistics Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${showForm ? 'hidden' : ''}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Inmates</p>
                <p className="text-2xl font-bold text-gray-900">{inmates.length}</p>
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
                  {inmates.filter(i => i.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaUserTimes className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Isolation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inmates.filter(i => i.status === 'Isolation').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medical Attention</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inmates.filter(i => i.healthStatus === 'Medical Attention').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inmates Detailed Cards */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${showForm ? 'hidden' : ''}`}>
          <div id="inmates-list" className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Inmates ({filteredInmates.length})
            </h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInmates.map((inmate) => (
              <div key={inmate.id} className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Prisoner No.</p>
                    <p className="text-base font-semibold text-gray-900">{inmate.inmateId}</p>
                  </div>
                  <span className={getStatusBadge(inmate.status)}>{inmate.status}</span>
                </div>

                {/* Body */}
                <div className="p-4 flex items-start gap-4">
                  {/* Photo */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                    {inmate.photoUrl ? (
                      <img src={inmate.photoUrl} alt={`${inmate.name} photo`} className="w-full h-full object-cover" />
                    ) : (
                      <FaIdCard className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{inmate.name}</p>
                      <p className="text-gray-500 mt-2">Gender / Age</p>
                      <p className="text-gray-900">{inmate.gender}{inmate.age !== '' ? ` • ${inmate.age}` : ''}</p>
                      <p className="text-gray-500 mt-2">Nationality</p>
                      <p className="text-gray-900">{inmate.nationality || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="text-gray-900 flex items-center"><FaMapMarkerAlt className="mr-1 text-gray-400" /> {inmate.block}</p>
                      <p className="text-gray-500 mt-2">Cell</p>
                      <p className="text-gray-900">{inmate.cell || '—'}</p>
                      <p className="text-gray-500 mt-2">Health</p>
                      <p className="text-gray-900">{inmate.healthStatus}</p>
                    </div>
                  </div>
                </div>

                {/* Legal & Dates */}
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Primary Charge</p>
                    <p className="text-gray-900">{inmate.crime || '—'}</p>
                    <p className="text-gray-500 mt-2">Sentence</p>
                    <p className="text-gray-900">{inmate.sentence || '—'} {inmate.sentenceType ? `(${inmate.sentenceType.replaceAll('_',' ')})` : ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Admission</p>
                    <p className="text-gray-900">{inmate.admissionDate ? new Date(inmate.admissionDate).toLocaleDateString() : '—'}</p>
                    <p className="text-gray-500 mt-2">Expected Release</p>
                    <p className="text-gray-900">{inmate.releaseDate ? new Date(inmate.releaseDate).toLocaleDateString() : '—'}</p>
                  </div>
                </div>

                {/* Emergency & Medical (compact) */}
                <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Emergency Contact</p>
                    <p className="text-gray-900">{inmate.emergencyContact?.name || '—'}{inmate.emergencyContact?.relationship ? `, ${inmate.emergencyContact.relationship}` : ''}</p>
                    <p className="text-gray-900">{inmate.emergencyContact?.phone || ''}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Medical</p>
                    <p className="text-gray-900">{inmate.medicalInfo?.chronicConditions?.length ? inmate.medicalInfo.chronicConditions.join(', ') : inmate.medicalInfo?.medicalNotes || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInmates.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inmates found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </WardenLayout>
  );
};

export default InmatesManagement;
