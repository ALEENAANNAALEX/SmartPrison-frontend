import React, { useState, useEffect } from 'react';
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

const MySchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);

  // Mock schedule data
  const mockSchedules = [
    {
      id: 1,
      title: 'Morning Security Patrol',
      date: '2024-01-22',
      startTime: '06:00',
      endTime: '08:00',
      location: 'Block A & B',
      type: 'Security',
      status: 'Scheduled',
      description: 'Regular morning security patrol of assigned blocks'
    },
    {
      id: 2,
      title: 'Inmate Counseling Session',
      date: '2024-01-22',
      startTime: '10:00',
      endTime: '11:00',
      location: 'Counseling Room 1',
      type: 'Counseling',
      status: 'Scheduled',
      description: 'Individual counseling session with John Doe'
    },
    {
      id: 3,
      title: 'Lunch Duty Supervision',
      date: '2024-01-22',
      startTime: '12:00',
      endTime: '13:00',
      location: 'Cafeteria',
      type: 'Supervision',
      status: 'Scheduled',
      description: 'Supervise lunch period and maintain order'
    },
    {
      id: 4,
      title: 'Behavior Assessment Review',
      date: '2024-01-22',
      startTime: '15:00',
      endTime: '16:00',
      location: 'Office',
      type: 'Administrative',
      status: 'Completed',
      description: 'Review and submit weekly behavior assessments'
    },
    {
      id: 5,
      title: 'Evening Security Rounds',
      date: '2024-01-22',
      startTime: '18:00',
      endTime: '20:00',
      location: 'All Blocks',
      type: 'Security',
      status: 'Scheduled',
      description: 'Evening security rounds and facility check'
    },
    // Tomorrow's schedule
    {
      id: 6,
      title: 'Morning Briefing',
      date: '2024-01-23',
      startTime: '07:00',
      endTime: '07:30',
      location: 'Staff Room',
      type: 'Meeting',
      status: 'Scheduled',
      description: 'Daily staff briefing and updates'
    },
    {
      id: 7,
      title: 'Group Counseling Session',
      date: '2024-01-23',
      startTime: '14:00',
      endTime: '15:30',
      location: 'Counseling Room 2',
      type: 'Counseling',
      status: 'Scheduled',
      description: 'Group therapy session for substance abuse recovery'
    }
  ];

  useEffect(() => {
    setSchedules(mockSchedules);
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getSchedulesForDate = (date) => {
    const dateStr = formatDate(date);
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      'Security': 'bg-red-100 text-red-800',
      'Counseling': 'bg-purple-100 text-purple-800',
      'Supervision': 'bg-orange-100 text-orange-800',
      'Administrative': 'bg-blue-100 text-blue-800',
      'Meeting': 'bg-green-100 text-green-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  };

  const todaySchedules = getSchedulesForDate(selectedDate);
  const isToday = formatDate(selectedDate) === formatDate(new Date());

  return (
    <StaffLayout title="My Schedule" subtitle="View your daily schedule and assignments">
      <div className="space-y-6">
        {/* Date Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FaChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              {isToday && (
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Today
                </span>
              )}
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FaChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(tomorrow);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Tomorrow
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
                <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{todaySchedules.length}</p>
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
                  {todaySchedules.filter(s => s.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todaySchedules.filter(s => s.status === 'Scheduled').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaClock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Schedule for {selectedDate.toLocaleDateString()}
            </h3>
          </div>
          
          {todaySchedules.length > 0 ? (
            <div className="p-6">
              <div className="space-y-4">
                {todaySchedules
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((schedule) => (
                  <div key={schedule.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FaClock className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{schedule.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center text-sm text-gray-500">
                              <FaClock className="mr-1" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FaMapMarkerAlt className="mr-1" />
                              {schedule.location}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-3">
                            <span className={getTypeBadge(schedule.type)}>
                              {schedule.type}
                            </span>
                            <span className={getStatusBadge(schedule.status)}>
                              {schedule.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          {schedule.status === 'Scheduled' && (
                            <button
                              onClick={() => alert(`Marking ${schedule.title} as completed`)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}
                          {schedule.status === 'Completed' && (
                            <div className="flex items-center text-green-600">
                              <FaCheckCircle className="mr-1" />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule for this date</h3>
              <p className="mt-1 text-sm text-gray-500">
                You have no scheduled tasks for {selectedDate.toLocaleDateString()}.
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Schedule Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming This Week</h3>
          <div className="space-y-3">
            {schedules
              .filter(schedule => {
                const scheduleDate = new Date(schedule.date);
                const today = new Date();
                const weekFromNow = new Date();
                weekFromNow.setDate(today.getDate() + 7);
                return scheduleDate >= today && scheduleDate <= weekFromNow;
              })
              .slice(0, 5)
              .map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{schedule.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(schedule.date).toLocaleDateString()} at {schedule.startTime}
                      </p>
                    </div>
                  </div>
                  <span className={getTypeBadge(schedule.type)}>
                    {schedule.type}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default MySchedule;
