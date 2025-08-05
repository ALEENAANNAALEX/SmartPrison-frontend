import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { 
  FaComments, 
  FaSearch, 
  FaFilter, 
  FaPlus,
  FaEye, 
  FaEdit,
  FaSave,
  FaTimes,
  FaIdCard,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser
} from 'react-icons/fa';

const CounselingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Session form data
  const [sessionForm, setSessionForm] = useState({
    inmateId: '',
    inmateName: '',
    sessionType: 'Individual',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: '60',
    topic: '',
    notes: '',
    goals: '',
    progress: '',
    nextSession: ''
  });

  // Mock sessions data
  const mockSessions = [
    {
      id: 1,
      sessionId: 'CS001',
      inmateId: 'INM001',
      inmateName: 'John Doe',
      sessionType: 'Individual',
      date: '2024-01-22',
      time: '10:00',
      duration: '60',
      topic: 'Anger Management',
      notes: 'Good progress in understanding triggers. Practiced breathing techniques.',
      goals: 'Continue anger management techniques, practice daily meditation',
      progress: 'Significant improvement',
      nextSession: '2024-01-29',
      status: 'Completed',
      counselor: 'Dr. Emily Rodriguez'
    },
    {
      id: 2,
      sessionId: 'CS002',
      inmateId: 'INM002',
      inmateName: 'Jane Smith',
      sessionType: 'Group',
      date: '2024-01-23',
      time: '14:00',
      duration: '90',
      topic: 'Substance Abuse Recovery',
      notes: 'Participated actively in group discussion. Shared personal experiences.',
      goals: 'Continue group participation, work on relapse prevention',
      progress: 'Good engagement',
      nextSession: '2024-01-30',
      status: 'Scheduled',
      counselor: 'Dr. Emily Rodriguez'
    },
    {
      id: 3,
      sessionId: 'CS003',
      inmateId: 'INM003',
      inmateName: 'Mike Johnson',
      sessionType: 'Individual',
      date: '2024-01-24',
      time: '11:00',
      duration: '45',
      topic: 'Behavioral Therapy',
      notes: 'Discussed recent incidents. Working on impulse control strategies.',
      goals: 'Implement coping strategies, reduce aggressive behavior',
      progress: 'Slow but steady',
      nextSession: '2024-01-31',
      status: 'In Progress',
      counselor: 'Dr. Emily Rodriguez'
    }
  ];

  // Mock inmates for dropdown
  const mockInmates = [
    { id: 'INM001', name: 'John Doe' },
    { id: 'INM002', name: 'Jane Smith' },
    { id: 'INM003', name: 'Mike Johnson' },
    { id: 'INM004', name: 'Sarah Wilson' }
  ];

  useEffect(() => {
    setSessions(mockSessions);
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.inmateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmitSession = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newSession = {
        id: sessions.length + 1,
        sessionId: `CS${String(sessions.length + 1).padStart(3, '0')}`,
        inmateId: sessionForm.inmateId,
        inmateName: sessionForm.inmateName,
        sessionType: sessionForm.sessionType,
        date: sessionForm.date,
        time: sessionForm.time,
        duration: sessionForm.duration,
        topic: sessionForm.topic,
        notes: sessionForm.notes,
        goals: sessionForm.goals,
        progress: sessionForm.progress,
        nextSession: sessionForm.nextSession,
        status: 'Scheduled',
        counselor: 'Current Staff Member'
      };

      setSessions([newSession, ...sessions]);
      
      setNotification({
        type: 'success',
        message: `✅ Counseling session scheduled successfully. ID: ${newSession.sessionId}`
      });

      // Reset form
      setSessionForm({
        inmateId: '',
        inmateName: '',
        sessionType: 'Individual',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: '60',
        topic: '',
        notes: '',
        goals: '',
        progress: '',
        nextSession: ''
      });
      setShowSessionModal(false);

      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      setNotification({
        type: 'error',
        message: '❌ Failed to schedule session. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
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
      'Individual': 'bg-purple-100 text-purple-800',
      'Group': 'bg-orange-100 text-orange-800',
      'Family': 'bg-green-100 text-green-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <StaffLayout title="Counseling Sessions" subtitle="Schedule and manage inmate counseling sessions">
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
                placeholder="Search sessions..."
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
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowSessionModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Schedule Session
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaComments className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaClock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === 'Scheduled').length}
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
                  {sessions.filter(s => s.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <FaUser className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Counseling Sessions ({filteredSessions.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inmate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Topic
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
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">ID: {session.sessionId}</div>
                        <div className="text-sm text-gray-500">Duration: {session.duration} min</div>
                        <div className="text-sm text-gray-500">Counselor: {session.counselor}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaIdCard className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{session.inmateName}</div>
                          <div className="text-sm text-gray-500">ID: {session.inmateId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <div>
                          <div>{new Date(session.date).toLocaleDateString()}</div>
                          <div className="text-gray-500">{session.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getTypeBadge(session.sessionType)}>
                          {session.sessionType}
                        </span>
                        <div className="text-sm text-gray-900">{session.topic}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(session.status)}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert(`Viewing details for session ${session.sessionId}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Editing session ${session.sessionId}`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <FaComments className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Schedule Counseling Session</h3>
                <button 
                  onClick={() => setShowSessionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitSession} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Inmate *</label>
                  <select
                    value={sessionForm.inmateId}
                    onChange={(e) => {
                      const selectedInmate = mockInmates.find(inmate => inmate.id === e.target.value);
                      setSessionForm({
                        ...sessionForm, 
                        inmateId: e.target.value,
                        inmateName: selectedInmate ? selectedInmate.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an inmate</option>
                    {mockInmates.map((inmate) => (
                      <option key={inmate.id} value={inmate.id}>
                        {inmate.name} ({inmate.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Type *</label>
                  <select
                    value={sessionForm.sessionType}
                    onChange={(e) => setSessionForm({...sessionForm, sessionType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="Individual">Individual</option>
                    <option value="Group">Group</option>
                    <option value="Family">Family</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={sessionForm.time}
                    onChange={(e) => setSessionForm({...sessionForm, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
                  <select
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({...sessionForm, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Session Date</label>
                  <input
                    type="date"
                    value={sessionForm.nextSession}
                    onChange={(e) => setSessionForm({...sessionForm, nextSession: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Topic *</label>
                <input
                  type="text"
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({...sessionForm, topic: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Anger Management, Substance Abuse Recovery"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Goals</label>
                <textarea
                  value={sessionForm.goals}
                  onChange={(e) => setSessionForm({...sessionForm, goals: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="What do you hope to achieve in this session?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
                <textarea
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional notes or preparation details..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {loading ? 'Scheduling...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default CounselingSessions;
