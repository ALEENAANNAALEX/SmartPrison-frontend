import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaMapMarkerAlt,
  FaPlay,
  FaTrash,
  FaEye,
  FaBuilding,
  FaUserTie,
  FaSun,
  FaMoon,
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const AutoScheduleManager = ({ schedules, onScheduleUpdate, onScheduleDelete, onScheduleAdd }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('day');
  const [loading, setLoading] = useState(false);
  const [availableStaff, setAvailableStaff] = useState({
    central: [],
    blockA: [],
    blockB: []
  });
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const { showSuccess, showError } = useNotification();

  // API helpers
  const getApiBase = () => (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
  const getToken = () => (sessionStorage.getItem('token') || localStorage.getItem('token'));

  // Load available staff for the selected date and shift
  const loadAvailableStaff = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const API_BASE = getApiBase();

      // Load staff for central facility
      const centralResponse = await fetch(
        `${API_BASE}/api/warden/staff/available/central?date=${selectedDate}&shift=${selectedShift}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const centralData = await centralResponse.json();

      // Load staff for Block A
      const blockAResponse = await fetch(
        `${API_BASE}/api/warden/staff/available/blocks?date=${selectedDate}&shift=${selectedShift}&blockType=A`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const blockAData = await blockAResponse.json();

      // Load staff for Block B
      const blockBResponse = await fetch(
        `${API_BASE}/api/warden/staff/available/blocks?date=${selectedDate}&shift=${selectedShift}&blockType=B`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const blockBData = await blockBResponse.json();

      setAvailableStaff({
        central: centralData.staff || [],
        blockA: blockAData.staff || [],
        blockB: blockBData.staff || []
      });

    } catch (error) {
      console.error('Error loading available staff:', error);
      showError('Failed to load available staff');
    } finally {
      setLoading(false);
    }
  };

  // Generate auto-schedule for selected date and shift
  const generateAutoSchedule = async () => {
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
        showSuccess(`Auto-schedule generated successfully! Created ${data.count} schedules.`);
        
        // Refresh available staff and notify parent component
        await loadAvailableStaff();
        if (onScheduleAdd) {
          onScheduleAdd(); // Just trigger refresh, don't pass schedules
        }
      } else {
        const errorData = await response.json();
        showError(errorData.msg || 'Failed to generate auto-schedule');
      }
    } catch (error) {
      console.error('Error generating auto-schedule:', error);
      showError('Failed to generate auto-schedule');
    } finally {
      setLoading(false);
    }
  };

  // Clear auto-scheduled items for selected date and shift
  const clearAutoSchedule = async () => {
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
        showSuccess(`Cleared ${data.deletedCount} auto-scheduled items.`);
        
        // Refresh available staff and notify parent component
        await loadAvailableStaff();
        if (onScheduleDelete) {
          // Notify parent to refresh schedules
          onScheduleDelete('refresh');
        }
      } else {
        const errorData = await response.json();
        showError(errorData.msg || 'Failed to clear auto-schedule');
      }
    } catch (error) {
      console.error('Error clearing auto-schedule:', error);
      showError('Failed to clear auto-schedule');
    } finally {
      setLoading(false);
    }
  };

  // Load available staff when date or shift changes
  useEffect(() => {
    loadAvailableStaff();
  }, [selectedDate, selectedShift]);

  // Get schedules for selected date and shift
  const getSchedulesForDateAndShift = () => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
      return scheduleDate === selectedDate && schedule.shift === selectedShift;
    });
  };

  // Get auto-scheduled items count
  const getAutoScheduledCount = () => {
    return getSchedulesForDateAndShift().filter(schedule => schedule.isAutoScheduled).length;
  };

  const currentSchedules = getSchedulesForDateAndShift();

  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FaCalendarAlt className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Auto-Schedule Manager</h3>
            <p className="text-sm text-gray-600">Generate automatic staff schedules for day and night shifts</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowStaffDetails(!showStaffDetails)}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FaEye className="mr-2" />
          {showStaffDetails ? 'Hide' : 'Show'} Staff Details
        </button>
      </div>

      {/* Date and Shift Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            onClick={loadAvailableStaff}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <FaSync className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Current Schedule Status */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaCheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Auto-scheduled items: {getAutoScheduledCount()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaUsers className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Total schedules: {currentSchedules.length}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={generateAutoSchedule}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <FaPlay className="mr-2" />
              Generate Auto-Schedule
            </button>
            
            {getAutoScheduledCount() > 0 && (
              <button
                onClick={clearAutoSchedule}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <FaTrash className="mr-2" />
                Clear Auto-Schedule
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Staff Availability Details */}
      {showStaffDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Central Facility Staff */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaBuilding className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-800">Central Facility</h4>
            </div>
            <p className="text-sm text-green-700 mb-2">
              Available staff: {availableStaff.central.length}
            </p>
            <p className="text-xs text-green-600">
              All available staff can be assigned to central facilities
            </p>
          </div>

          {/* Block A Staff */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaMapMarkerAlt className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-800">Block A</h4>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Available staff: {availableStaff.blockA.length}
            </p>
            <p className="text-xs text-blue-600">
              Only staff not already scheduled for Block A
            </p>
          </div>

          {/* Block B Staff */}
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FaMapMarkerAlt className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-purple-800">Block B</h4>
            </div>
            <p className="text-sm text-purple-700 mb-2">
              Available staff: {availableStaff.blockB.length}
            </p>
            <p className="text-xs text-purple-600">
              Only staff not already scheduled for Block B
            </p>
          </div>
        </div>
      )}


      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default AutoScheduleManager;
