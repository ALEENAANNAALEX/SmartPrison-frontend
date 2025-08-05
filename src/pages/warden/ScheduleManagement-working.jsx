import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
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
  FaExclamationTriangle
} from 'react-icons/fa';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

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
    setSchedules(mockSchedules);
  }, []);

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || schedule.type === filterType;
    const matchesDate = !filterDate || schedule.date === filterDate;
    
    return matchesSearch && matchesType && matchesDate;
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
      'Visitation': 'bg-purple-100 text-purple-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <WardenLayout title="Schedule Management" subtitle="Manage and coordinate all facility schedules">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Security">Security</option>
              <option value="Medical">Medical</option>
              <option value="Rehabilitation">Rehabilitation</option>
              <option value="Work">Work</option>
              <option value="Visitation">Visitation</option>
            </select>
            
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Schedule
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaCalendarAlt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
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

        {/* Schedules Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Schedules ({filteredSchedules.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Staff
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">{schedule.title}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={getTypeBadge(schedule.type)}>
                            {schedule.type}
                          </span>
                          <span className={getPriorityBadge(schedule.priority)}>
                            {schedule.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{schedule.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <div>
                          <div>{new Date(schedule.date).toLocaleDateString()}</div>
                          <div className="text-gray-500">{schedule.startTime} - {schedule.endTime}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {schedule.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaUserTie className="mr-2 text-gray-400" />
                        <div>
                          {schedule.assignedStaff.map((staff, index) => (
                            <div key={index} className="text-sm text-gray-900">
                              {staff}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(schedule.status)}>
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert(`Viewing details for ${schedule.title}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Editing ${schedule.title}`)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Schedule"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Deleting ${schedule.title}`)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Schedule"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSchedules.length === 0 && (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Schedule Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Schedule</h3>
            <p className="text-gray-600 mb-4">Schedule creation form would go here.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Schedule creation functionality would be implemented here');
                  setShowAddModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </WardenLayout>
  );
};

export default ScheduleManagement;
