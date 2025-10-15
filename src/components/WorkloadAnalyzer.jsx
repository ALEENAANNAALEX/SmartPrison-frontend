import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FaChartBar, 
  FaUsers, 
  FaClock, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaLightbulb,
  FaCalendarAlt,
  FaDownload,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaEquals
} from 'react-icons/fa';

const WorkloadAnalyzer = () => {
  const [workloadData, setWorkloadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [sortBy, setSortBy] = useState('totalShifts'); // totalShifts, name, dayShifts, nightShifts
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const { showSuccess, showError } = useNotification();

  // API helpers
  const getApiBase = () => (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
  const getToken = () => (sessionStorage.getItem('token') || localStorage.getItem('token'));

  // Load workload analysis
  const loadWorkloadAnalysis = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const API_BASE = getApiBase();

      const response = await fetch(
        `${API_BASE}/api/warden/ai-schedule/workload-analysis?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWorkloadData(data.analysis);
      } else {
        const errorData = await response.json();
        showError(errorData.msg || 'Failed to load workload analysis');
      }
    } catch (error) {
      console.error('Error loading workload analysis:', error);
      showError('Failed to load workload analysis');
    } finally {
      setLoading(false);
    }
  };

  // Load analysis when date range changes
  useEffect(() => {
    loadWorkloadAnalysis();
  }, [dateRange]);

  // Sort workload data
  const getSortedWorkload = () => {
    if (!workloadData || !workloadData.staffWorkload) return [];

    return [...workloadData.staffWorkload].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.staff.name.toLowerCase();
          bValue = b.staff.name.toLowerCase();
          break;
        case 'dayShifts':
          aValue = a.dayShifts;
          bValue = b.dayShifts;
          break;
        case 'nightShifts':
          aValue = a.nightShifts;
          bValue = b.nightShifts;
          break;
        default:
          aValue = a.totalShifts;
          bValue = b.totalShifts;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get workload status for a staff member
  const getWorkloadStatus = (staff) => {
    const avgShifts = workloadData?.summary?.avgShifts || 0;
    const threshold = avgShifts * 0.2; // 20% threshold

    if (staff.totalShifts > avgShifts + threshold) {
      return { status: 'overworked', color: 'text-red-600', bg: 'bg-red-50', icon: FaArrowUp };
    } else if (staff.totalShifts < avgShifts - threshold) {
      return { status: 'underutilized', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: FaArrowDown };
    } else {
      return { status: 'balanced', color: 'text-green-600', bg: 'bg-green-50', icon: FaEquals };
    }
  };

  // Export workload data
  const exportWorkloadData = () => {
    if (!workloadData) return;

    const csvData = [
      ['Staff Name', 'Total Shifts', 'Day Shifts', 'Night Shifts', 'Locations', 'Status'],
      ...workloadData.staffWorkload.map(staff => [
        staff.staff.name,
        staff.totalShifts,
        staff.dayShifts,
        staff.nightShifts,
        staff.locations.join(', '),
        getWorkloadStatus(staff).status
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workload-analysis-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showSuccess('Workload data exported successfully');
  };

  const sortedWorkload = getSortedWorkload();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaChartBar className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Workload Analysis</h2>
              <p className="text-gray-600">Analyze staff workload distribution and fairness</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={exportWorkloadData}
              disabled={!workloadData}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
            
            <button
              onClick={loadWorkloadAnalysis}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FaFilter className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Statistics */}
      {workloadData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{workloadData.summary.totalStaff}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaClock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Shifts</p>
                <p className="text-2xl font-bold text-gray-900">{workloadData.summary.avgShifts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaArrowUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Max Shifts</p>
                <p className="text-2xl font-bold text-gray-900">{workloadData.summary.maxShifts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaArrowDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Min Shifts</p>
                <p className="text-2xl font-bold text-gray-900">{workloadData.summary.minShifts}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {workloadData && workloadData.recommendations && workloadData.recommendations.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaLightbulb className="mr-2 text-yellow-600" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {workloadData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  rec.type === 'overworked' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  <FaExclamationTriangle className={`h-4 w-4 ${
                    rec.type === 'overworked' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{rec.message}</p>
                  <p className="text-sm text-gray-600">{rec.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workload Table */}
      {workloadData && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Staff Workload Details</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Staff Name</span>
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalShifts')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Total Shifts</span>
                      {sortBy === 'totalShifts' && (
                        sortOrder === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('dayShifts')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Day Shifts</span>
                      {sortBy === 'dayShifts' && (
                        sortOrder === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('nightShifts')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Night Shifts</span>
                      {sortBy === 'nightShifts' && (
                        sortOrder === 'asc' ? <FaArrowUp className="h-3 w-3" /> : <FaArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedWorkload.map((staff, index) => {
                  const status = getWorkloadStatus(staff);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FaUsers className="h-5 w-5 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{staff.staff.name}</div>
                            <div className="text-sm text-gray-500">{staff.staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{staff.totalShifts}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.dayShifts}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.nightShifts}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {staff.locations.length > 3 
                            ? `${staff.locations.slice(0, 3).join(', ')} +${staff.locations.length - 3} more`
                            : staff.locations.join(', ')
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading workload analysis...</span>
        </div>
      )}

      {/* No Data State */}
      {!loading && workloadData && (!workloadData.staffWorkload || workloadData.staffWorkload.length === 0) && (
        <div className="text-center py-12">
          <FaChartBar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Workload Data</h3>
          <p className="text-gray-600">
            No schedules found for the selected date range. Try selecting a different period.
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkloadAnalyzer;
