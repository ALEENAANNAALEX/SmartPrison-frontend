import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FaRobot, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaClock, 
  FaSun, 
  FaMoon, 
  FaChartLine, 
  FaLightbulb,
  FaPlay,
  FaTrash,
  FaSave,
  FaUndo,
  FaRedo,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaGripVertical
} from 'react-icons/fa';

const AIScheduleEditor = ({ schedules, onScheduleUpdate, onScheduleDelete, onScheduleAdd }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('day');
  const [loading, setLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState(null);
  const [draggedStaff, setDraggedStaff] = useState(null);
  const [dragOverLocation, setDragOverLocation] = useState(null);
  const [optimizationScore, setOptimizationScore] = useState(null);
  const { showSuccess, showError } = useNotification();

  // API helpers
  const getApiBase = () => (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
  const getToken = () => (sessionStorage.getItem('token') || localStorage.getItem('token'));

  // Define all locations with their requirements
  const locations = {
    'Main Gate': { 
      type: 'central', 
      requiredStaff: 2, 
      department: 'Security',
      nightShiftAllowed: true,
      priority: 'high',
      color: 'bg-red-100 border-red-300'
    },
    'Control Room': { 
      type: 'central', 
      requiredStaff: 1, 
      department: 'Control',
      nightShiftAllowed: true,
      priority: 'high',
      color: 'bg-blue-100 border-blue-300'
    },
    'Medical Room': { 
      type: 'central', 
      requiredStaff: 2, 
      department: 'Medical',
      nightShiftAllowed: true,
      priority: 'high',
      color: 'bg-green-100 border-green-300'
    },
    'Kitchen': { 
      type: 'central', 
      requiredStaff: 3, 
      department: 'General',
      nightShiftAllowed: false,
      priority: 'medium',
      color: 'bg-yellow-100 border-yellow-300'
    },
    'Visitor Area': { 
      type: 'central', 
      requiredStaff: 2, 
      department: 'Security',
      nightShiftAllowed: false,
      priority: 'medium',
      color: 'bg-purple-100 border-purple-300'
    },
    'Admin Office': { 
      type: 'central', 
      requiredStaff: 2, 
      department: 'Administration',
      nightShiftAllowed: false,
      priority: 'medium',
      color: 'bg-indigo-100 border-indigo-300'
    },
    'Workshop': { 
      type: 'central', 
      requiredStaff: 2, 
      department: 'General',
      nightShiftAllowed: false,
      priority: 'medium',
      color: 'bg-orange-100 border-orange-300'
    },
    'Isolation': { 
      type: 'central', 
      requiredStaff: 2, 
      department: 'Security',
      nightShiftAllowed: true,
      priority: 'high',
      color: 'bg-gray-100 border-gray-300'
    },
    'Block A - Cells': { 
      type: 'block-a', 
      requiredStaff: 2, 
      department: 'Security',
      nightShiftAllowed: true,
      priority: 'high',
      color: 'bg-blue-100 border-blue-300'
    },
    'Block B - Cells': { 
      type: 'block-b', 
      requiredStaff: 2, 
      department: 'Security',
      nightShiftAllowed: true,
      priority: 'high',
      color: 'bg-green-100 border-green-300'
    }
  };

  // Get schedules for current date and shift
  const getCurrentSchedules = () => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
      return scheduleDate === selectedDate && schedule.shift === selectedShift;
    });
  };

  // Get staff assigned to a specific location
  const getStaffForLocation = (location) => {
    const locationSchedules = getCurrentSchedules().filter(schedule => 
      schedule.location === location
    );
    
    const allStaff = [];
    locationSchedules.forEach(schedule => {
      if (schedule.assignedStaff && Array.isArray(schedule.assignedStaff)) {
        schedule.assignedStaff.forEach(staff => {
          const staffName = typeof staff === 'object' ? staff.name : staff;
          if (staffName && !allStaff.find(s => s.name === staffName)) {
            allStaff.push({
              id: typeof staff === 'object' ? staff._id : staff,
              name: staffName,
              scheduleId: schedule._id
            });
          }
        });
      }
    });
    
    return allStaff;
  };

  // Generate AI schedule
  const generateAISchedule = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const API_BASE = getApiBase();

      const response = await fetch(`${API_BASE}/api/warden/auto-schedule/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          shift: selectedShift
        })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(`AI scheduling completed successfully! Created ${data.count} schedules.`);
        
        // Update optimization score
        if (data.optimization) {
          setOptimizationScore(data.optimization);
        }
        
        if (onScheduleAdd) {
          onScheduleAdd();
        }
      } else {
        const errorData = await response.json();
        showError(errorData.msg || 'Failed to generate AI schedule');
      }
    } catch (error) {
      console.error('Error generating AI schedule:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        showError('Backend server is not running. Please start the server on port 5000.');
      } else {
        showError('Failed to generate AI schedule. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear auto-scheduled items
  const clearAISchedule = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const API_BASE = getApiBase();

      const response = await fetch(`${API_BASE}/api/warden/auto-schedule/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          shift: selectedShift
        })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(`Cleared ${data.deletedCount} AI-scheduled items.`);
        
        if (onScheduleDelete) {
          onScheduleDelete('refresh');
        }
      } else {
        const errorData = await response.json();
        showError(errorData.msg || 'Failed to clear AI schedule');
      }
    } catch (error) {
      console.error('Error clearing AI schedule:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        showError('Backend server is not running. Please start the server on port 5000.');
      } else {
        showError('Failed to clear AI schedule. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load AI insights
  const loadInsights = async () => {
    try {
      const token = getToken();
      const API_BASE = getApiBase();

      const response = await fetch(`${API_BASE}/api/warden/ai-schedule/insights?date=${selectedDate}&shift=${selectedShift}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
        setShowInsights(true);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, staff, fromLocation) => {
    setDraggedStaff({ staff, fromLocation });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, location) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLocation(location);
  };

  const handleDragLeave = (e) => {
    setDragOverLocation(null);
  };

  const handleDrop = async (e, toLocation) => {
    e.preventDefault();
    
    if (!draggedStaff) return;
    
    const { staff, fromLocation } = draggedStaff;
    
    // Don't allow dropping on the same location
    if (fromLocation === toLocation) {
      setDraggedStaff(null);
      setDragOverLocation(null);
      return;
    }

    try {
      // Check if location allows night shift staff
      const locationConfig = locations[toLocation];
      if (selectedShift === 'night' && !locationConfig.nightShiftAllowed) {
        showError(`${toLocation} is not available during night shift`);
        setDraggedStaff(null);
        setDragOverLocation(null);
        return;
      }

      // Check department requirements
      const staffDepartment = getStaffDepartment(staff);
      const requiredDepartment = locationConfig.department;
      
      if (!isStaffSuitableForLocation(staffDepartment, requiredDepartment)) {
        showError(`${staff.name} cannot be assigned to ${toLocation} (department mismatch)`);
        setDraggedStaff(null);
        setDragOverLocation(null);
        return;
      }

      // Find the schedule to update
      const currentSchedules = getCurrentSchedules();
      const sourceSchedule = currentSchedules.find(s => 
        s.location === fromLocation && 
        s.assignedStaff.some(s => (typeof s === 'object' ? s._id : s) === staff.id)
      );

      if (sourceSchedule) {
        // Remove staff from source location
        const updatedStaff = sourceSchedule.assignedStaff.filter(s => 
          (typeof s === 'object' ? s._id : s) !== staff.id
        );

        // Update source schedule
        if (updatedStaff.length > 0) {
          await updateScheduleStaff(sourceSchedule._id, updatedStaff);
        } else {
          // Delete schedule if no staff left
          await deleteSchedule(sourceSchedule._id);
        }

        // Add staff to destination location
        await addStaffToLocation(toLocation, staff);
        
        showSuccess(`Moved ${staff.name} from ${fromLocation} to ${toLocation}`);
      }

    } catch (error) {
      console.error('Error moving staff:', error);
      showError('Failed to move staff member');
    } finally {
      setDraggedStaff(null);
      setDragOverLocation(null);
    }
  };

  // Helper functions
  const getStaffDepartment = (staff) => {
    // This would need to be implemented based on your staff data structure
    return 'Security'; // Placeholder
  };

  const isStaffSuitableForLocation = (staffDepartment, requiredDepartment) => {
    if (requiredDepartment === 'General') return true;
    return staffDepartment.toLowerCase().includes(requiredDepartment.toLowerCase());
  };

  const updateScheduleStaff = async (scheduleId, staffIds) => {
    const token = getToken();
    const API_BASE = getApiBase();

    const response = await fetch(`${API_BASE}/api/warden/schedules/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assignedStaff: staffIds
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update schedule');
    }

    if (onScheduleUpdate) {
      const data = await response.json();
      onScheduleUpdate(data.schedule);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    const token = getToken();
    const API_BASE = getApiBase();

    const response = await fetch(`${API_BASE}/api/warden/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete schedule');
    }

    if (onScheduleDelete) {
      onScheduleDelete(scheduleId);
    }
  };

  const addStaffToLocation = async (location, staff) => {
    // Find existing schedule for this location
    const currentSchedules = getCurrentSchedules();
    const existingSchedule = currentSchedules.find(s => s.location === location);

    if (existingSchedule) {
      // Add to existing schedule
      const updatedStaff = [...existingSchedule.assignedStaff, staff.id];
      await updateScheduleStaff(existingSchedule._id, updatedStaff);
    } else {
      // Create new schedule
      const token = getToken();
      const API_BASE = getApiBase();

      const shiftTimes = selectedShift === 'day' 
        ? { start: '06:00', end: '18:00' }
        : { start: '18:00', end: '06:00' };

      const response = await fetch(`${API_BASE}/api/warden/schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${location} - ${selectedShift.charAt(0).toUpperCase() + selectedShift.slice(1)} Shift`,
          type: 'Security',
          description: `Manual assignment for ${location}`,
          date: selectedDate,
          startTime: shiftTimes.start,
          endTime: shiftTimes.end,
          shift: selectedShift,
          location: location,
          assignedStaff: [staff.id],
          priority: 'Medium',
          status: 'Scheduled'
        })
      });

      if (response.ok && onScheduleAdd) {
        const data = await response.json();
        onScheduleAdd(data.schedule);
      }
    }
  };

  // Filter locations based on shift
  const getFilteredLocations = () => {
    return Object.keys(locations).filter(location => {
      const config = locations[location];
      if (selectedShift === 'night') {
        return config.nightShiftAllowed;
      }
      return true;
    });
  };

  const currentSchedules = getCurrentSchedules();
  const filteredLocations = getFilteredLocations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FaRobot className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Schedule Editor</h2>
              <p className="text-gray-600">Drag and drop staff between locations • AI-powered optimization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadInsights}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaChartLine className="mr-2" />
              Insights
            </button>
            
            <button
              onClick={generateAISchedule}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <FaPlay className="mr-2" />
              Generate AI Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Date and Shift Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedShift('day')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedShift === 'day'
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaSun className="mr-2" />
              Day (06:00-18:00)
            </button>
            <button
              onClick={() => setSelectedShift('night')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedShift === 'night'
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaMoon className="mr-2" />
              Night (18:00-06:00)
            </button>
          </div>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={clearAISchedule}
            disabled={loading || currentSchedules.length === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            <FaTrash className="mr-2" />
            Clear All
          </button>
        </div>
      </div>

      {/* Optimization Score */}
      {optimizationScore && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Optimization Score</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{optimizationScore.fairnessScore}</div>
              <div className="text-sm text-gray-600">Fairness Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{optimizationScore.efficiencyScore}%</div>
              <div className="text-sm text-gray-600">Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{optimizationScore.totalStaff}</div>
              <div className="text-sm text-gray-600">Total Staff</div>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map(location => {
          const locationConfig = locations[location];
          const assignedStaff = getStaffForLocation(location);
          const isDragOver = dragOverLocation === location;
          const isUnderstaffed = assignedStaff.length < locationConfig.requiredStaff;
          const isOverstaffed = assignedStaff.length > locationConfig.requiredStaff;

          return (
            <div
              key={location}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                isDragOver 
                  ? 'border-indigo-500 bg-indigo-50 scale-105' 
                  : locationConfig.color
              } ${isUnderstaffed ? 'ring-2 ring-red-300' : ''} ${isOverstaffed ? 'ring-2 ring-yellow-300' : ''}`}
              onDragOver={(e) => handleDragOver(e, location)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, location)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{location}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    locationConfig.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {locationConfig.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    assignedStaff.length >= locationConfig.requiredStaff ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {assignedStaff.length}/{locationConfig.requiredStaff}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-3">
                <div>Department: {locationConfig.department}</div>
                <div>Type: {locationConfig.type}</div>
              </div>

              {/* Staff List */}
              <div className="space-y-2 min-h-[100px]">
                {assignedStaff.map((staff, index) => (
                  <div
                    key={`${staff.id}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, staff, location)}
                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 cursor-move hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <FaGripVertical className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{staff.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        // Remove staff from location
                        const schedule = currentSchedules.find(s => s._id === staff.scheduleId);
                        if (schedule) {
                          const updatedStaff = schedule.assignedStaff.filter(s => 
                            (typeof s === 'object' ? s._id : s) !== staff.id
                          );
                          if (updatedStaff.length > 0) {
                            updateScheduleStaff(schedule._id, updatedStaff);
                          } else {
                            deleteSchedule(schedule._id);
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {assignedStaff.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No staff assigned
                    <br />
                    <span className="text-xs">Drop staff here</span>
                  </div>
                )}
              </div>

              {/* Status Indicators */}
              <div className="mt-3 flex items-center justify-between">
                {isUnderstaffed && (
                  <div className="flex items-center text-red-600 text-xs">
                    <FaExclamationTriangle className="mr-1" />
                    Understaffed
                  </div>
                )}
                {isOverstaffed && (
                  <div className="flex items-center text-yellow-600 text-xs">
                    <FaExclamationTriangle className="mr-1" />
                    Overstaffed
                  </div>
                )}
                {!isUnderstaffed && !isOverstaffed && assignedStaff.length > 0 && (
                  <div className="flex items-center text-green-600 text-xs">
                    <FaCheckCircle className="mr-1" />
                    Optimized
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Insights Modal */}
      {showInsights && insights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">AI Insights & Recommendations</h3>
              <button
                onClick={() => setShowInsights(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaArrowLeft />
              </button>
            </div>

            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Current Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Schedules</div>
                    <div className="text-lg font-bold text-indigo-600">{insights.currentSchedules}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Available Staff</div>
                    <div className="text-lg font-bold text-green-600">{insights.totalAvailableStaff}</div>
                  </div>
                </div>
              </div>

              {/* Staff Distribution */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Staff Distribution</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>Medical: {insights.staffDistribution.medical}</div>
                  <div>Control: {insights.staffDistribution.control}</div>
                  <div>Admin: {insights.staffDistribution.administration}</div>
                  <div>Security: {insights.staffDistribution.security}</div>
                  <div>General: {insights.staffDistribution.general}</div>
                </div>
              </div>

              {/* Optimization Metrics */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Optimization Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Fairness Score</div>
                    <div className="text-lg font-bold text-blue-600">{insights.optimization.fairnessScore}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Efficiency Score</div>
                    <div className="text-lg font-bold text-green-600">{insights.optimization.efficiencyScore}%</div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <FaLightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{rec.message}</div>
                          <div className="text-xs text-gray-600">{rec.suggestion}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowInsights(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Processing...</span>
        </div>
      )}
    </div>
  );
};

export default AIScheduleEditor;
