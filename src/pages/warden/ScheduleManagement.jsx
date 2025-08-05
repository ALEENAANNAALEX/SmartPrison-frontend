import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaPlus, 
  FaEdit, 
  FaTrash,
  FaUsers,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaDownload
} from 'react-icons/fa';

const ScheduleManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('week'); // week, month, day
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Mock schedule data
  const mockSchedules = [
    {
      id: 1,
      title: 'Morning Headcount',
      type: 'Security',
      time: '06:00',
      duration: '30 min',
      location: 'All Blocks',
      assignedStaff: ['Officer Wilson', 'Officer Brown'],
      date: '2024-01-22',
      status: 'Scheduled',
      priority: 'High'
    },
    {
      id: 2,
      title: 'Breakfast Service',
      type: 'Meal',
      time: '07:00',
      duration: '90 min',
      location: 'Cafeteria',
      assignedStaff: ['Kitchen Staff', 'Security Team'],
      date: '2024-01-22',
      status: 'In Progress',
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'Medical Rounds',
      type: 'Medical',
      time: '09:00',
      duration: '120 min',
      location: 'Medical Wing',
      assignedStaff: ['Dr. Brown', 'Nurse Johnson'],
      date: '2024-01-22',
      status: 'Scheduled',
      priority: 'High'
    },
    {
      id: 4,
      title: 'Recreation Time',
      type: 'Recreation',
      time: '14:00',
      duration: '60 min',
      location: 'Yard',
      assignedStaff: ['Officer Rodriguez', 'Officer Davis'],
      date: '2024-01-22',
      status: 'Scheduled',
      priority: 'Low'
    },
    {
      id: 5,
      title: 'Counseling Sessions',
      type: 'Rehabilitation',
      time: '10:00',
      duration: '180 min',
      location: 'Counseling Center',
      assignedStaff: ['Lisa Chen', 'Dr. Martinez'],
      date: '2024-01-23',
      status: 'Scheduled',
      priority: 'Medium'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSchedules(mockSchedules);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type) => {
    const colors = {
      'Security': 'bg-red-100 text-red-800 border-red-200',
      'Medical': 'bg-green-100 text-green-800 border-green-200',
      'Meal': 'bg-blue-100 text-blue-800 border-blue-200',
      'Recreation': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Rehabilitation': 'bg-purple-100 text-purple-800 border-purple-200',
      'Maintenance': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTodaySchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.date === today);
  };

  const getUpcomingSchedules = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.date > today).slice(0, 5);
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filterType === 'all') return true;
    return schedule.type === filterType;
  });

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
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="Security">Security</option>
              <option value="Medical">Medical</option>
              <option value="Meal">Meals</option>
              <option value="Recreation">Recreation</option>
              <option value="Rehabilitation">Rehabilitation</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FaChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                {formatDate(currentDate)}
              </span>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <FaDownload className="mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <FaPlus className="mr-2" />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div className="p-3 rounded-full bg-green-100">
                <FaClock className="h-6 w-6 text-green-600" />
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
              <div className="p-3 rounded-full bg-yellow-100">
                <FaUsers className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Staff Assigned</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaMapMarkerAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {getTodaySchedules().map((schedule) => (
                  <div key={schedule.id} className={`border rounded-lg p-4 ${getTypeColor(schedule.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(schedule.priority)}`}></div>
                          <h4 className="font-semibold text-gray-900">{schedule.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                            {schedule.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaClock className="mr-2" />
                            {schedule.time} ({schedule.duration})
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2" />
                            {schedule.location}
                          </div>
                          <div className="flex items-center col-span-2">
                            <FaUsers className="mr-2" />
                            {schedule.assignedStaff.join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Activities</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {getUpcomingSchedules().map((schedule) => (
                  <div key={schedule.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(schedule.priority)}`}></div>
                      <h4 className="font-medium text-gray-900 text-sm">{schedule.title}</h4>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(schedule.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-1" />
                        {schedule.time}
                      </div>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-1" />
                        {schedule.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All Schedules Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              All Schedules ({filteredSchedules.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${getPriorityColor(schedule.priority)}`}></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(schedule.type)}`}>
                            {schedule.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(schedule.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {schedule.time} ({schedule.duration})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {schedule.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.assignedStaff.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WardenLayout>
  );
};

export default ScheduleManagement;
