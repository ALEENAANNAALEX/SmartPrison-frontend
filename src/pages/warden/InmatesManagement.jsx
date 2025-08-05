import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEye,
  FaEdit,
  FaUserCheck,
  FaUserTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaExclamationTriangle
} from 'react-icons/fa';

const InmatesManagement = () => {
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBlock, setFilterBlock] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [inmateForm, setInmateForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    crime: '',
    sentence: '',
    admissionDate: '',
    expectedRelease: '',
    block: 'A',
    cellNumber: '',
    medicalConditions: '',
    allergies: '',
    behaviorLevel: 'Medium',
    notes: ''
  });

  // Mock data for inmates
  const mockInmates = [
    {
      id: 1,
      inmateId: 'INM001',
      name: 'John Doe',
      age: 28,
      gender: 'Male',
      block: 'Block A',
      cell: 'A-101',
      status: 'Active',
      crime: 'Theft',
      sentence: '5 years',
      admissionDate: '2023-01-15',
      releaseDate: '2028-01-15',
      behavior: 'Good',
      healthStatus: 'Healthy'
    },
    {
      id: 2,
      inmateId: 'INM002',
      name: 'Jane Smith',
      age: 32,
      gender: 'Female',
      block: 'Block B',
      cell: 'B-205',
      status: 'Active',
      crime: 'Fraud',
      sentence: '3 years',
      admissionDate: '2023-06-20',
      releaseDate: '2026-06-20',
      behavior: 'Excellent',
      healthStatus: 'Healthy'
    },
    {
      id: 3,
      inmateId: 'INM003',
      name: 'Mike Johnson',
      age: 35,
      gender: 'Male',
      block: 'Block A',
      cell: 'A-150',
      status: 'Isolation',
      crime: 'Assault',
      sentence: '7 years',
      admissionDate: '2022-03-10',
      releaseDate: '2029-03-10',
      behavior: 'Poor',
      healthStatus: 'Medical Attention'
    }
  ];

  useEffect(() => {
    // Set mock data immediately for testing
    setInmates(mockInmates);
  }, []);

  const handleSubmitInmate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/warden/inmates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...inmateForm,
          admittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotification({
            type: 'success',
            message: `✅ Inmate added successfully! Inmate ID: ${data.inmate.inmateId}`
          });

          // Add to local state for immediate UI update
          const newInmate = {
            id: inmates.length + 1,
            inmateId: data.inmate.inmateId,
            name: inmateForm.name,
            age: parseInt(inmateForm.age),
            gender: inmateForm.gender,
            block: `Block ${inmateForm.block}`,
            cell: `${inmateForm.block}-${inmateForm.cellNumber}`,
            status: 'Active',
            crime: inmateForm.crime,
            sentence: inmateForm.sentence,
            admissionDate: inmateForm.admissionDate,
            releaseDate: inmateForm.expectedRelease,
            behavior: inmateForm.behaviorLevel,
            healthStatus: 'Good'
          };

          setInmates([...inmates, newInmate]);

          // Reset form
          setInmateForm({
            name: '',
            age: '',
            gender: 'Male',
            dateOfBirth: '',
            address: '',
            emergencyContact: '',
            emergencyPhone: '',
            crime: '',
            sentence: '',
            admissionDate: '',
            expectedRelease: '',
            block: 'A',
            cellNumber: '',
            medicalConditions: '',
            allergies: '',
            behaviorLevel: 'Medium',
            notes: ''
          });
          setShowAddModal(false);
        } else {
          setNotification({
            type: 'error',
            message: `❌ ${data.msg || 'Failed to add inmate'}`
          });
        }
      } else {
        setNotification({
          type: 'error',
          message: '❌ Failed to add inmate. Please try again.'
        });
      }

      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      console.error('Add inmate error:', error);
      setNotification({
        type: 'error',
        message: '❌ Failed to add inmate. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredInmates = inmates.filter(inmate => {
    const matchesSearch = inmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inmate.inmateId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inmate.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesBlock = filterBlock === 'all' || inmate.block === filterBlock;
    
    return matchesSearch && matchesStatus && matchesBlock;
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
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Blocks</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
              <option value="Block D">Block D</option>
            </select>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <FaPlus className="mr-2" />
            Add New Inmate
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        {/* Inmates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Inmates List ({filteredInmates.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inmate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crime & Sentence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Behavior
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInmates.map((inmate) => (
                  <tr key={inmate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaIdCard className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{inmate.name}</div>
                          <div className="text-sm text-gray-500">ID: {inmate.inmateId}</div>
                          <div className="text-sm text-gray-500">{inmate.age} years, {inmate.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        <div>
                          <div>{inmate.block}</div>
                          <div className="text-gray-500">Cell: {inmate.cell}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(inmate.status)}>
                        {inmate.status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{inmate.healthStatus}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inmate.crime}</div>
                      <div className="text-sm text-gray-500">{inmate.sentence}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <FaCalendarAlt className="mr-1" />
                        Release: {new Date(inmate.releaseDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getBehaviorBadge(inmate.behavior)}>
                        {inmate.behavior}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInmates.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inmates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </WardenLayout>
  );
};

export default InmatesManagement;
