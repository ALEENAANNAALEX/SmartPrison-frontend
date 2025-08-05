import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaBuilding, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit,
  FaUsers,
  FaShieldAlt,
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSave,
  FaTimes,
  FaMapMarkerAlt,
  FaCog,
  FaChartBar
} from 'react-icons/fa';

const PrisonBlocks = () => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSecurity, setFilterSecurity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const [blockForm, setBlockForm] = useState({
    name: '',
    blockCode: '',
    description: '',
    totalCapacity: '',
    securityLevel: 'medium',
    blockType: 'general',
    floor: '',
    wing: '',
    facilities: [],
    blockRules: []
  });

  const [facilityForm, setFacilityForm] = useState({
    name: '',
    description: '',
    isOperational: true
  });

  const [ruleForm, setRuleForm] = useState({
    rule: '',
    severity: 'medium'
  });

  // Mock data for testing
  const mockBlocks = [
    {
      id: 1,
      name: 'Alpha Block',
      blockCode: 'ALPHA-01',
      description: 'Main general population block',
      totalCapacity: 200,
      currentOccupancy: 185,
      securityLevel: 'medium',
      blockType: 'general',
      floor: 1,
      wing: 'North',
      isActive: true,
      isUnderMaintenance: false,
      facilities: [
        { name: 'Recreation Room', description: 'Indoor recreation facility', isOperational: true },
        { name: 'Library', description: 'Reading and study area', isOperational: true }
      ],
      blockRules: [
        { rule: 'No loud noise after 10 PM', severity: 'medium' },
        { rule: 'Mandatory cell inspection daily', severity: 'high' }
      ],
      statistics: {
        totalIncidents: 12,
        averageBehaviorScore: 3.8,
        inspectionScore: 85
      },
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Beta Block',
      blockCode: 'BETA-02',
      description: 'High security block for violent offenders',
      totalCapacity: 100,
      currentOccupancy: 95,
      securityLevel: 'maximum',
      blockType: 'general',
      floor: 2,
      wing: 'South',
      isActive: true,
      isUnderMaintenance: false,
      facilities: [
        { name: 'Exercise Yard', description: 'Outdoor exercise area', isOperational: true },
        { name: 'Medical Station', description: 'Basic medical care', isOperational: false }
      ],
      blockRules: [
        { rule: 'Escort required for all movements', severity: 'high' },
        { rule: 'Limited recreation time', severity: 'medium' }
      ],
      statistics: {
        totalIncidents: 28,
        averageBehaviorScore: 2.1,
        inspectionScore: 78
      },
      createdAt: '2024-01-10'
    }
  ];

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/warden/prison-blocks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('📋 Fetched prison blocks:', data.blocks);
          setBlocks(data.blocks);
        } else {
          console.error('Failed to fetch blocks:', data.msg);
          setBlocks(mockBlocks);
        }
      } else {
        console.error('Failed to fetch blocks');
        setBlocks(mockBlocks);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setBlocks(mockBlocks);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBlock = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/warden/prison-blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...blockForm,
          totalCapacity: parseInt(blockForm.totalCapacity),
          floor: parseInt(blockForm.floor)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotification({
            type: 'success',
            message: `✅ Prison block created successfully! Block Code: ${data.block.blockCode}`
          });

          fetchBlocks(); // Refresh the list

          // Reset form
          setBlockForm({
            name: '',
            blockCode: '',
            description: '',
            totalCapacity: '',
            securityLevel: 'medium',
            blockType: 'general',
            floor: '',
            wing: '',
            facilities: [],
            blockRules: []
          });
          setShowAddModal(false);
        } else {
          setNotification({
            type: 'error',
            message: `❌ ${data.msg || 'Failed to create prison block'}`
          });
        }
      } else {
        setNotification({
          type: 'error',
          message: '❌ Failed to create prison block. Please try again.'
        });
      }

      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      console.error('Create prison block error:', error);
      setNotification({
        type: 'error',
        message: '❌ Failed to create prison block. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const addFacility = () => {
    if (facilityForm.name.trim()) {
      setBlockForm({
        ...blockForm,
        facilities: [...blockForm.facilities, { ...facilityForm }]
      });
      setFacilityForm({
        name: '',
        description: '',
        isOperational: true
      });
    }
  };

  const addRule = () => {
    if (ruleForm.rule.trim()) {
      setBlockForm({
        ...blockForm,
        blockRules: [...blockForm.blockRules, { ...ruleForm }]
      });
      setRuleForm({
        rule: '',
        severity: 'medium'
      });
    }
  };

  const removeFacility = (index) => {
    const newFacilities = blockForm.facilities.filter((_, i) => i !== index);
    setBlockForm({ ...blockForm, facilities: newFacilities });
  };

  const removeRule = (index) => {
    const newRules = blockForm.blockRules.filter((_, i) => i !== index);
    setBlockForm({ ...blockForm, blockRules: newRules });
  };

  const filteredBlocks = blocks.filter(block => {
    const matchesSearch = block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.blockCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSecurity = filterSecurity === 'all' || block.securityLevel === filterSecurity;
    const matchesType = filterType === 'all' || block.blockType === filterType;
    
    return matchesSearch && matchesSecurity && matchesType;
  });

  const getSecurityBadge = (level) => {
    const colors = {
      'minimum': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'maximum': 'bg-red-100 text-red-800',
      'supermax': 'bg-purple-100 text-purple-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[level] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTypeBadge = (type) => {
    const colors = {
      'general': 'bg-blue-100 text-blue-800',
      'isolation': 'bg-orange-100 text-orange-800',
      'medical': 'bg-green-100 text-green-800',
      'protective': 'bg-purple-100 text-purple-800',
      'death_row': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`;
  };

  const getOccupancyColor = (current, total) => {
    const percentage = (current / total) * 100;
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <WardenLayout title="Prison Blocks" subtitle="Manage prison blocks, capacity, and facilities">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterSecurity}
              onChange={(e) => setFilterSecurity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Security Levels</option>
              <option value="minimum">Minimum</option>
              <option value="medium">Medium</option>
              <option value="maximum">Maximum</option>
              <option value="supermax">Supermax</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="isolation">Isolation</option>
              <option value="medical">Medical</option>
              <option value="protective">Protective</option>
              <option value="death_row">Death Row</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add New Block</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaBuilding className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Blocks</p>
                <p className="text-2xl font-bold text-gray-900">{blocks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blocks.reduce((sum, block) => sum + (block.totalCapacity || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaChartBar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Occupancy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blocks.reduce((sum, block) => sum + (block.currentOccupancy || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaTools className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Maintenance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {blocks.filter(block => block.isUnderMaintenance).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaBuilding className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No blocks found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new prison block.</p>
            </div>
          ) : (
            filteredBlocks.map((block) => (
              <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{block.name}</h3>
                      {block.isUnderMaintenance && (
                        <FaTools className="h-4 w-4 text-orange-500" title="Under Maintenance" />
                      )}
                      {!block.isActive && (
                        <FaExclamationTriangle className="h-4 w-4 text-red-500" title="Inactive" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{block.blockCode}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Security Level:</span>
                        <span className={getSecurityBadge(block.securityLevel)}>
                          {block.securityLevel?.charAt(0).toUpperCase() + block.securityLevel?.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className={getTypeBadge(block.blockType)}>
                          {block.blockType?.replace('_', ' ').charAt(0).toUpperCase() + block.blockType?.replace('_', ' ').slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Occupancy:</span>
                        <span className={`text-sm font-medium ${getOccupancyColor(block.currentOccupancy, block.totalCapacity)}`}>
                          {block.currentOccupancy || 0}/{block.totalCapacity || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm text-gray-900">
                          Floor {block.floor}, {block.wing} Wing
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Capacity</span>
                        <span>{Math.round(((block.currentOccupancy || 0) / (block.totalCapacity || 1)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            ((block.currentOccupancy || 0) / (block.totalCapacity || 1)) >= 0.95 ? 'bg-red-500' :
                            ((block.currentOccupancy || 0) / (block.totalCapacity || 1)) >= 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(((block.currentOccupancy || 0) / (block.totalCapacity || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Statistics */}
                    {block.statistics && (
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Incidents:</span> {block.statistics.totalIncidents || 0}
                        </div>
                        <div>
                          <span className="font-medium">Behavior:</span> {block.statistics.averageBehaviorScore || 0}/5
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedBlock(block);
                      setShowDetailsModal(true);
                    }}
                    className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 flex items-center justify-center space-x-1 text-sm"
                  >
                    <FaEye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBlock(block);
                      setBlockForm({
                        name: block.name,
                        blockCode: block.blockCode,
                        description: block.description,
                        totalCapacity: block.totalCapacity.toString(),
                        securityLevel: block.securityLevel,
                        blockType: block.blockType,
                        floor: block.floor.toString(),
                        wing: block.wing,
                        facilities: block.facilities || [],
                        blockRules: block.blockRules || []
                      });
                      setShowAddModal(true);
                    }}
                    className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center justify-center space-x-1 text-sm"
                  >
                    <FaEdit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WardenLayout>
  );
};

export default PrisonBlocks;
