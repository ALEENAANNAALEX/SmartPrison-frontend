import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { 
  FaExclamationTriangle, 
  FaSearch, 
  FaFilter, 
  FaPlus,
  FaEye, 
  FaEdit,
  FaSave,
  FaTimes,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaCheckCircle
} from 'react-icons/fa';

const ReportIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Incident form data
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    location: '',
    involvedInmates: '',
    witnesses: '',
    actionTaken: '',
    dateTime: new Date().toISOString().slice(0, 16),
    reportedBy: 'Current Staff Member'
  });

  // Mock incidents data
  const mockIncidents = [
    {
      id: 1,
      incidentId: 'INC001',
      title: 'Altercation in Cafeteria',
      description: 'Minor disagreement between two inmates during lunch',
      severity: 'Medium',
      location: 'Cafeteria',
      involvedInmates: 'John Doe, Mike Johnson',
      witnesses: 'Staff Member A, Inmate C',
      actionTaken: 'Separated inmates, counseling scheduled',
      dateTime: '2024-01-20T14:30',
      reportedBy: 'Sarah Wilson',
      status: 'Resolved',
      submittedDate: '2024-01-20'
    },
    {
      id: 2,
      incidentId: 'INC002',
      title: 'Medical Emergency',
      description: 'Inmate collapsed during work duty',
      severity: 'High',
      location: 'Workshop',
      involvedInmates: 'Jane Smith',
      witnesses: 'Workshop Supervisor, 3 inmates',
      actionTaken: 'Medical attention provided, transferred to medical wing',
      dateTime: '2024-01-19T10:15',
      reportedBy: 'Dr. Michael Brown',
      status: 'Under Investigation',
      submittedDate: '2024-01-19'
    }
  ];

  useEffect(() => {
    setIncidents(mockIncidents);
  }, []);

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.incidentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/staff/incident-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...incidentForm,
          reportedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotification({
            type: 'success',
            message: `✅ Incident report submitted successfully! Report ID: ${data.report.incidentId}`
          });

          // Add to local state for immediate UI update
          const newIncident = {
            id: incidents.length + 1,
            incidentId: data.report.incidentId,
            title: incidentForm.title,
            description: incidentForm.description,
            severity: incidentForm.severity,
            location: incidentForm.location,
            involvedInmates: incidentForm.involvedInmates,
            witnesses: incidentForm.witnesses,
            actionTaken: incidentForm.actionTaken,
            dateTime: incidentForm.dateTime,
            reportedBy: incidentForm.reportedBy,
            status: 'Under Investigation',
            submittedDate: new Date().toISOString().split('T')[0]
          };

          setIncidents([newIncident, ...incidents]);

          // Reset form
          setIncidentForm({
            title: '',
            description: '',
            severity: 'Medium',
            location: '',
            involvedInmates: '',
            witnesses: '',
            actionTaken: '',
            dateTime: new Date().toISOString().slice(0, 16),
            reportedBy: 'Current Staff Member'
          });
          setShowIncidentModal(false);
        } else {
          setNotification({
            type: 'error',
            message: `❌ ${data.msg || 'Failed to submit incident report'}`
          });
        }
      } else {
        setNotification({
          type: 'error',
          message: '❌ Failed to submit incident report. Please try again.'
        });
      }

      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      console.error('Submit incident report error:', error);
      setNotification({
        type: 'error',
        message: '❌ Failed to submit incident report. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const severityColors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800',
      'Critical': 'bg-purple-100 text-purple-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${severityColors[severity] || 'bg-gray-100 text-gray-800'}`;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Under Investigation': 'bg-yellow-100 text-yellow-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Pending': 'bg-blue-100 text-blue-800',
      'Closed': 'bg-gray-100 text-gray-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <StaffLayout title="Report Incidents" subtitle="Report and track facility incidents">
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
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          
          <button 
            onClick={() => setShowIncidentModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Report Incident
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Investigation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'Under Investigation').length}
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
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.status === 'Resolved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaExclamationTriangle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incidents.filter(i => i.severity === 'High' || i.severity === 'Critical').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Incident Reports ({filteredIncidents.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{incident.title}</div>
                        <div className="text-sm text-gray-500">ID: {incident.incidentId}</div>
                        <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                          {incident.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <div>
                          <div>{new Date(incident.dateTime).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(incident.dateTime).toLocaleTimeString()}</div>
                          <div className="text-gray-500 flex items-center mt-1">
                            <FaMapMarkerAlt className="mr-1" />
                            {incident.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getSeverityBadge(incident.severity)}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(incident.status)}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{incident.reportedBy}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(incident.submittedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert(`Viewing details for ${incident.title}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Editing ${incident.title}`)}
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
          
          {filteredIncidents.length === 0 && (
            <div className="text-center py-12">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No incidents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Report New Incident</h3>
                <button 
                  onClick={() => setShowIncidentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitIncident} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incident Title *</label>
                  <input
                    type="text"
                    value={incidentForm.title}
                    onChange={(e) => setIncidentForm({...incidentForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief title of the incident"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({...incidentForm, severity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={incidentForm.dateTime}
                    onChange={(e) => setIncidentForm({...incidentForm, dateTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <select
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({...incidentForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select location</option>
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Block C">Block C</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Medical Wing">Medical Wing</option>
                    <option value="Visitor Center">Visitor Center</option>
                    <option value="Recreation Area">Recreation Area</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incident Description *</label>
                <textarea
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Detailed description of what happened..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Involved Inmates</label>
                  <input
                    type="text"
                    value={incidentForm.involvedInmates}
                    onChange={(e) => setIncidentForm({...incidentForm, involvedInmates: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Names or IDs of involved inmates"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Witnesses</label>
                  <input
                    type="text"
                    value={incidentForm.witnesses}
                    onChange={(e) => setIncidentForm({...incidentForm, witnesses: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Names of witnesses"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Taken</label>
                <textarea
                  value={incidentForm.actionTaken}
                  onChange={(e) => setIncidentForm({...incidentForm, actionTaken: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe any immediate actions taken..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default ReportIncidents;
