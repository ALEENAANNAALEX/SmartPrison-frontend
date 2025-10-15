import React, { useState, useEffect, useCallback, useRef } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const StaffScheduleView = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ completed: 0, upcoming: 0, pending: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const isLoadingRef = useRef(false);
  const lastLoadedDateRef = useRef(null);
  const scheduleCacheRef = useRef(new Map());

  const loadSchedule = useCallback(async (date = new Date()) => {
    const dateString = date.toISOString().split('T')[0];
    
    // Check cache first
    if (scheduleCacheRef.current.has(dateString)) {
      console.log('📅 Using cached schedule for:', dateString);
      const cachedData = scheduleCacheRef.current.get(dateString);
      setSchedule(cachedData.schedules);
      setCounts(cachedData.counts);
      return;
    }
    
    if (isLoadingRef.current) {
      console.log('⏳ Already loading, skipping...');
      return;
    }
    
    try {
      console.log('🔄 Loading fresh schedule for:', dateString);
      isLoadingRef.current = true;
      setLoading(true);
      
      // FORCE CLEAR - Set to empty array immediately
      setSchedule([]);
      
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      
      const res = await fetch(`${API_BASE}/api/staff/my-schedule?date=${y}-${m}-${d}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('📅 Raw API response - schedules:', data.schedules?.length || 0);
        
        // ULTRA STRONG DEDUPLICATION
        const uniqueSchedules = [];
        const seenIds = new Set();
        const seenContent = new Set();
        
        (data.schedules || []).forEach((s, index) => {
          const scheduleId = s._id;
          const contentKey = `${s.title}-${s.startTime}-${s.endTime}-${s.location}`;
          
          console.log(`📅 Processing schedule ${index + 1}:`, {
            id: scheduleId,
            title: s.title,
            contentKey: contentKey
          });
          
          // Check both ID and content uniqueness
          if (!seenIds.has(scheduleId) && !seenContent.has(contentKey)) {
            seenIds.add(scheduleId);
            seenContent.add(contentKey);
            
            const scheduleItem = {
              id: scheduleId,
              date: s.date,
              time: `${s.startTime} - ${s.endTime}`,
              activity: s.title,
              location: s.location,
              status: (s.status || '').toLowerCase().replace('in progress', 'upcoming'),
              type: s.type || 'General',
              priority: s.priority || 'Medium',
              description: s.description || ''
            };
            
            uniqueSchedules.push(scheduleItem);
            console.log('✅ Added unique schedule:', scheduleItem.activity);
          } else {
            console.log('🚫 DUPLICATE REJECTED:', {
              id: scheduleId,
              title: s.title,
              reason: seenIds.has(scheduleId) ? 'duplicate ID' : 'duplicate content'
            });
          }
        });
        
        console.log('📅 FINAL RESULT - Unique schedules:', uniqueSchedules.length);
        console.log('📅 Schedule details:', uniqueSchedules.map(s => ({ id: s.id, activity: s.activity })));
        
        // Cache the result
        const cacheData = {
          schedules: uniqueSchedules,
          counts: data.counts || { completed: 0, upcoming: 0, pending: 0 }
        };
        scheduleCacheRef.current.set(dateString, cacheData);
        
        setSchedule(uniqueSchedules);
        setCounts(cacheData.counts);
        lastLoadedDateRef.current = dateString;
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('📅 API error:', errorData);
        setSchedule([]);
        setCounts({ completed: 0, upcoming: 0, pending: 0 });
      }
    } catch (e) {
      console.error('📅 Error loading schedule:', e);
      setSchedule([]);
      setCounts({ completed: 0, upcoming: 0, pending: 0 });
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadSchedule(currentDate);
  }, [currentDate, loadSchedule]);

  // Clear schedule on component mount to prevent stale data
  useEffect(() => {
    setSchedule([]);
    scheduleCacheRef.current.clear();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />;
      case 'upcoming':
        return <FaClock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <FaClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
    
    // Clear cache for new date to ensure fresh load
    const newDateString = newDate.toISOString().split('T')[0];
    scheduleCacheRef.current.delete(newDateString);
    
    loadSchedule(newDate);
  };

  return (
    <StaffLayout title="My Schedule" subtitle="View your daily schedule and activities">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-1">View your daily schedule and activities.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome, Staff Member</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{counts.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaClock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{counts.upcoming}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <button 
                    onClick={() => navigateDate(-1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FaChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <p className="text-sm text-gray-600">
                    {currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <button 
                    onClick={() => navigateDate(1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FaChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    // Clear cache and force fresh load
                    const dateString = currentDate.toISOString().split('T')[0];
                    scheduleCacheRef.current.delete(dateString);
                    loadSchedule(currentDate);
                  }} 
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Refresh
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
                      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
                      const res = await fetch(`${API_BASE}/api/staff/debug-schedule`, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      const data = await res.json();
                      console.log('🔍 Debug schedule info:', data);
                      alert(`Debug Info:\nStaff User ID: ${data.debug.staffUserId}\nStaff Name: ${data.debug.staffUserInfo?.name}\nTotal Schedules: ${data.debug.totalSchedulesInDB}\nMy Schedules: ${data.debug.mySchedulesCount}`);
                    } catch (e) {
                      console.error('Error loading debug info:', e);
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Debug Info
                </button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {loading && (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading schedule...</p>
              </div>
            )}
            {!loading && schedule.length === 0 && (
              <div className="p-6 text-center">
                <FaCalendarAlt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No schedules for this day.</p>
              </div>
            )}
            {!loading && schedule.length > 0 && schedule.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{item.activity}</h4>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaClock className="h-4 w-4 mr-2" />
                          {item.time}
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="h-4 w-4 mr-2" />
                          {item.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffScheduleView;
