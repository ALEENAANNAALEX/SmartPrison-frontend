import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import InteractiveScheduleMap from '../../components/InteractiveScheduleMap';
// Removed: AutoScheduleManager and AIScheduleEditor
import WorkloadAnalyzer from '../../components/WorkloadAnalyzer';
import ErrorBoundary from '../../components/ErrorBoundary';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaFilter, 
  FaPlus,
  FaEye, 
  FaEdit,
  FaTrash,
  FaClock,
  FaUsers,
  FaMapMarkerAlt,
  FaUserTie,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaArrowLeft,
  FaRobot,
  FaCogs,
  FaChartLine
} from 'react-icons/fa';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [staffMap, setStaffMap] = useState({});
  const [initialSelected, setInitialSelected] = useState(null);
  
  // View mode state - keep only 'map' and 'workload-analyzer'
  const [viewMode, setViewMode] = useState('map');

  // Form states for adding new schedules
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    type: 'Security',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    priority: 'Medium',
    assignedStaff: []
  });

  // Mock data for schedules
  const mockSchedules = [
    {
      id: 1,
      title: 'Morning Security Patrol',
      type: 'Security',
      date: '2024-01-22',
      startTime: '06:00',
      endTime: '08:00',
      location: 'All Blocks',
      assignedStaff: ['John Smith', 'Sarah Wilson'],
      status: 'Scheduled',
      priority: 'High',
      description: 'Regular morning security patrol of all prison blocks'
    },
    {
      id: 2,
      title: 'Medical Checkup - Block A',
      type: 'Medical',
      date: '2024-01-22',
      startTime: '09:00',
      endTime: '12:00',
      location: 'Block A',
      assignedStaff: ['Dr. Michael Brown', 'Nurse Lisa Chen'],
      status: 'In Progress',
      priority: 'Medium',
      description: 'Monthly health checkup for inmates in Block A'
    },
    {
      id: 3,
      title: 'Rehabilitation Session',
      type: 'Rehabilitation',
      date: '2024-01-22',
      startTime: '14:00',
      endTime: '16:00',
      location: 'Counseling Center',
      assignedStaff: ['Dr. Emily Rodriguez'],
      status: 'Scheduled',
      priority: 'Medium',
      description: 'Group therapy session for behavioral improvement'
    },
    {
      id: 4,
      title: 'Kitchen Duty Rotation',
      type: 'Work',
      date: '2024-01-22',
      startTime: '05:00',
      endTime: '07:00',
      location: 'Kitchen',
      assignedStaff: ['Chef Martinez', 'Guard Thompson'],
      status: 'Completed',
      priority: 'Low',
      description: 'Breakfast preparation with inmate work crew'
    },
    {
      id: 5,
      title: 'Visitor Hours',
      type: 'Visitation',
      date: '2024-01-22',
      startTime: '13:00',
      endTime: '17:00',
      location: 'Visitor Center',
      assignedStaff: ['Officer Davis', 'Officer Johnson'],
      status: 'Scheduled',
      priority: 'Medium',
      description: 'Regular visiting hours for family and legal visits'
    }
  ];

  useEffect(() => {
    loadSchedules();
    loadStaff();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      const response = await fetch(`${API_BASE}/api/warden/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure client does not hold onto auto-scheduled opposite-shift entries when user just generated a single shift
        setSchedules((data.schedules || []).map(s => ({ ...s })));
      } else {
        // Fallback to mock data if API fails
        setSchedules(mockSchedules);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      // Fallback to mock data
      setSchedules(mockSchedules);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      const res = await fetch(`${API_BASE}/api/warden/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        (data.staff || data.users || []).forEach(s => {
          const id = s._id || s.id;
          const name = s.name || s.email || 'Unknown';
          if (id) map[id] = name;
        });
        setStaffMap(map);
      }
    } catch (e) {
      // ignore
    }
  };

  const getStaffName = (staff) => {
    if (typeof staff === 'object') {
      const name = staff.name || staff.email || staff._id || 'Unknown';
      return name;
    }
    const name = staffMap[staff] || 'Unknown';
    return name;
  };

  // Mirror helper for Cells ↔ Dining Room per block
  const getMirrorLocation = (location) => {
    if (!location || typeof location !== 'string') return null;
    const map = {
      'Block A - Cells': 'Block A - Dining Room',
      'Block A - Dining Room': 'Block A - Cells',
      'Block B - Cells': 'Block B - Dining Room',
      'Block B - Dining Room': 'Block B - Cells'
    };
    return map[location] || null;
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      
      // Clean the schedule form data - remove any _id field to avoid duplicate key errors
      const cleanScheduleForm = { ...scheduleForm };
      delete cleanScheduleForm._id;
      delete cleanScheduleForm.id;
      delete cleanScheduleForm.createdAt;
      delete cleanScheduleForm.updatedAt;
      delete cleanScheduleForm.__v; // Remove MongoDB version field
      
      console.log('🔍 Creating schedule with clean form data:', cleanScheduleForm);
      
      const response = await fetch(`${API_BASE}/api/warden/schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanScheduleForm)
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(prev => [...prev, data.schedule]);
        setNotification({ type: 'success', message: '✅ Schedule created successfully!' });
        setScheduleForm({
          title: '',
          type: 'Security',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          description: '',
          priority: 'Medium',
          assignedStaff: []
        });
        setShowAddForm(false);
        setInitialSelected(data.schedule);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setNotification({ type: 'error', message: '❌ Failed to create schedule: ' + (errorData.message || 'Unknown error') });
      }

      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Create schedule error:', error);
      setNotification({ type: 'error', message: '❌ Failed to create schedule. Please try again.' });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (updatedSchedule) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      const response = await fetch(`${API_BASE}/api/warden/schedules/${updatedSchedule._id || updatedSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSchedule)
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(prev => {
          const updated = prev.map(schedule =>
            schedule._id === data.schedule._id ? data.schedule : schedule
          );
          // REMOVED: Client-side mirror schedule creation to prevent duplicates
          // const mirrorLoc = getMirrorLocation(data.schedule.location);
          // if (mirrorLoc) {
          //   // Sync or insert a client-side mirror so counts update instantly
          //   const existingMirrorIndex = updated.findIndex(s => !s._id && s.clientMirror && s.location === mirrorLoc && new Date(s.date).toISOString() === new Date(data.schedule.date).toISOString());
          //   const mirrorObj = {
          //     ...data.schedule,
          //     _id: undefined,
          //     location: mirrorLoc,
          //     clientMirror: true
          //   };
          //   if (existingMirrorIndex >= 0) {
          //     updated[existingMirrorIndex] = mirrorObj;
          //   } else {
          //     updated.push(mirrorObj);
          //   }
          // }
          return updated;
        });
        return true;
      } else {
        console.error('Failed to update schedule', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      return false;
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      if (scheduleId === 'refresh') {
        loadSchedules();
        return true;
      }

      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      const response = await fetch(`${API_BASE}/api/warden/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSchedules(prev => prev.filter(schedule => schedule._id !== scheduleId));
        return true;
      } else {
        console.error('Failed to delete schedule', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return false;
    }
  };

  const handleAddSchedule = async (newSchedule) => {
    // If no specific schedule provided (like after AI generation), reload all schedules
    if (!newSchedule) {
      console.log('🔄 Auto-reloading schedules after AI generation...');
      await loadSchedules();
      await loadStaff(); // Also reload staff to ensure staffMap is updated
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      
      // Clean the schedule data - remove any _id field to avoid duplicate key errors
      const cleanScheduleData = { ...newSchedule };
      delete cleanScheduleData._id;
      delete cleanScheduleData.id;
      delete cleanScheduleData.createdAt;
      delete cleanScheduleData.updatedAt;
      delete cleanScheduleData.__v; // Remove MongoDB version field
      
      console.log('🔍 Creating schedule with clean data:', cleanScheduleData);
      
      const response = await fetch(`${API_BASE}/api/warden/schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanScheduleData)
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(prev => {
          const next = [...prev, data.schedule];
          // REMOVED: Client-side mirror schedule creation to prevent duplicates
          // const mirrorLoc = getMirrorLocation(data.schedule.location);
          // if (mirrorLoc) {
          //   next.push({
          //     ...data.schedule,
          //     _id: undefined,
          //     location: mirrorLoc,
          //     clientMirror: true
          //   });
          // }
          return next;
        });
        setInitialSelected(data.schedule);
        return data.schedule;
      } else {
        console.error('Failed to create schedule', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      return null;
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || schedule.type === filterType;
    const matchesDate = !filterDate || new Date(schedule.date).toISOString().split('T')[0] === filterDate;
    const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
    
    return matchesSearch && matchesType && matchesDate && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      'Security': 'bg-red-100 text-red-800',
      'Medical': 'bg-blue-100 text-blue-800',
      'Rehabilitation': 'bg-green-100 text-green-800',
      'Work': 'bg-orange-100 text-orange-800',
      'Visitation': 'bg-purple-100 text-purple-800',
      'Meal': 'bg-blue-100 text-blue-800',
      'Recreation': 'bg-yellow-100 text-yellow-800',
      'Maintenance': 'bg-gray-100 text-gray-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTodaySchedules = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    return schedules.filter(s => {
      const sd = new Date(s.date);
      return sd.getFullYear() === y && sd.getMonth() === m && sd.getDate() === d;
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <WardenLayout title="Schedule Management" subtitle="Manage daily activities and staff schedules">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Schedule Management" subtitle="Manage daily activities and staff schedules">
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
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Search and Filters - removed as requested */}

        {/* Add New Schedule Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Schedule</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="inline-flex items-center text-indigo-600 hover:underline"
              >
                <FaArrowLeft className="mr-1" /> Back to list
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Security">Security</option>
                    <option value="Medical">Medical</option>
                    <option value="Rehabilitation">Rehabilitation</option>
                    <option value="Work">Work</option>
                    <option value="Visitation">Visitation</option>
                    <option value="Meal">Meal</option>
                    <option value="Recreation">Recreation</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={scheduleForm.priority}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, priority: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Back to list
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Statistics Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${showAddForm ? 'hidden' : ''}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaCalendarAlt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Activities</p>
                <p className="text-2xl font-bold text-gray-900">{getTodaySchedules().length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schedules.filter(s => s.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schedules.filter(s => s.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schedules.filter(s => s.priority === 'High').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        {!showAddForm && (
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setViewMode('map')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === 'map'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaMapMarkerAlt className="inline mr-2" />
                  Interactive Map
                </button>
                <button
                  onClick={() => setViewMode('workload-analyzer')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    viewMode === 'workload-analyzer'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaChartLine className="inline mr-2" />
                  Workload Analysis
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* View Content */}
        {!showAddForm && (
          <ErrorBoundary>
            {viewMode === 'map' && (
              <InteractiveScheduleMap
                schedules={filteredSchedules}
                onUpdateSchedule={handleUpdateSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onAddSchedule={handleAddSchedule}
                staffMap={staffMap}
                getStaffName={getStaffName}
                filterDate={filterDate}
                setFilterDate={setFilterDate}
              />
            )}
            
            {viewMode === 'workload-analyzer' && (
              <WorkloadAnalyzer />
            )}
          </ErrorBoundary>
        )}
      </div>
    </WardenLayout>
  );
};

export default ScheduleManagement;