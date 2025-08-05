import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaClipboardList, FaPlus, FaEye, FaSearch, FaCalendarAlt } from 'react-icons/fa';

const ActivityReports = () => {
  const [incidentReports, setIncidentReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incidents');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const [incidentFormData, setIncidentFormData] = useState({
    incidentType: '',
    description: '',
    severity: 'low',
    block: '',
    incidentDate: '',
    prisonersInvolved: '',
    actionTaken: '',
    followUpRequired: false
  });

  const [weeklyFormData, setWeeklyFormData] = useState({
    block: '',
    weekStartDate: '',
    weekEndDate: '',
    totalActivities: '',
    participationRate: '',
    incidentsCount: '',
    disciplinaryActions: '',
    positiveEvents: '',
    concerns: '',
    recommendations: ''
  });

  useEffect(() => {
    fetchIncidentReports();
    fetchWeeklyReports();
    fetchBlocks();
  }, []);

  const fetchIncidentReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/reports/incidents', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIncidentReports(data.reports);
        }
      }
    } catch (error) {
      console.error('Error fetching incident reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/reports/weekly', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWeeklyReports(data.reports);
        }
      }
    } catch (error) {
      console.error('Error fetching weekly reports:', error);
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/blocks', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBlocks(data.blocks);
        }
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleIncidentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/reports/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(incidentFormData)
      });

      if (response.ok) {
        fetchIncidentReports();
        setShowAddModal(false);
        setIncidentFormData({
          incidentType: '',
          description: '',
          severity: 'low',
          block: '',
          incidentDate: '',
          prisonersInvolved: '',
          actionTaken: '',
          followUpRequired: false
        });
      }
    } catch (error) {
      console.error('Error creating incident report:', error);
    }
  };

  const handleWeeklySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/reports/weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(weeklyFormData)
      });

      if (response.ok) {
        fetchWeeklyReports();
        setShowAddModal(false);
        setWeeklyFormData({
          block: '',
          weekStartDate: '',
          weekEndDate: '',
          totalActivities: '',
          participationRate: '',
          incidentsCount: '',
          disciplinaryActions: '',
          positiveEvents: '',
          concerns: '',
          recommendations: ''
        });
      }
    } catch (error) {
      console.error('Error creating weekly report:', error);
    }
  };

  // Filter reports based on active tab
  const getFilteredReports = () => {
    const reports = activeTab === 'incidents' ? incidentReports : weeklyReports;
    
    return reports.filter(report => {
      const matchesSearch = searchTerm === '' || 
        report.incidentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.block?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBlock = filterBlock === '' || report.block?._id === filterBlock;
      const matchesSeverity = filterSeverity === '' || report.severity === filterSeverity;
      
      return matchesSearch && matchesBlock && (activeTab === 'weekly' || matchesSeverity);
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Activity & Incident Reports" subtitle="Monitor prison activities and incidents">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Activity & Incident Reports" subtitle="Monitor prison activities and incidents">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('incidents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'incidents'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Incident Reports ({incidentReports.length})
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'weekly'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Weekly Activity Reports ({weeklyReports.length})
            </button>
          </nav>
        </div>

        {/* Action Bar */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <FaClipboardList className="text-2xl text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'incidents' ? 'Incident Reports' : 'Weekly Activity Reports'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'incidents' 
                    ? 'Track and manage security incidents' 
                    : 'Monitor weekly activities across all blocks'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Create {activeTab === 'incidents' ? 'Incident' : 'Weekly'} Report
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Blocks</option>
              {blocks.map((block) => (
                <option key={block._id} value={block._id}>{block.name}</option>
              ))}
            </select>
            
            {activeTab === 'incidents' && (
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            )}
            
            <div className="text-sm text-gray-600 flex items-center">
              Showing {getFilteredReports().length} reports
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'incidents' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incidents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredReports().map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  {activeTab === 'incidents' ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.incidentType}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{report.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.block?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.severity === 'high' ? 'bg-red-100 text-red-800' :
                          report.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.incidentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.reportedBy?.name || 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          report.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.reviewStatus || 'pending'}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {report.block?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.totalActivities || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.participationRate || 0}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.incidentsCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          report.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.reviewStatus || 'pending'}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Create {activeTab === 'incidents' ? 'Incident' : 'Weekly Activity'} Report
            </h3>
            
            {activeTab === 'incidents' ? (
              <form onSubmit={handleIncidentSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
                    <input
                      type="text"
                      value={incidentFormData.incidentType}
                      onChange={(e) => setIncidentFormData({...incidentFormData, incidentType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                      placeholder="e.g., Fight, Contraband, Medical Emergency"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={incidentFormData.severity}
                      onChange={(e) => setIncidentFormData({...incidentFormData, severity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                    <select
                      value={incidentFormData.block}
                      onChange={(e) => setIncidentFormData({...incidentFormData, block: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Block</option>
                      {blocks.map((block) => (
                        <option key={block._id} value={block._id}>{block.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Incident Date</label>
                    <input
                      type="datetime-local"
                      value={incidentFormData.incidentDate}
                      onChange={(e) => setIncidentFormData({...incidentFormData, incidentDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={incidentFormData.description}
                    onChange={(e) => setIncidentFormData({...incidentFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="4"
                    required
                    placeholder="Describe the incident in detail..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prisoners Involved</label>
                  <input
                    type="text"
                    value={incidentFormData.prisonersInvolved}
                    onChange={(e) => setIncidentFormData({...incidentFormData, prisonersInvolved: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Prisoner numbers or names (comma separated)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Taken</label>
                  <textarea
                    value={incidentFormData.actionTaken}
                    onChange={(e) => setIncidentFormData({...incidentFormData, actionTaken: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="What immediate action was taken?"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="followUpRequired"
                    checked={incidentFormData.followUpRequired}
                    onChange={(e) => setIncidentFormData({...incidentFormData, followUpRequired: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="followUpRequired" className="ml-2 block text-sm text-gray-900">
                    Follow-up required
                  </label>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Create Report
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleWeeklySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                  <select
                    value={weeklyFormData.block}
                    onChange={(e) => setWeeklyFormData({...weeklyFormData, block: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Block</option>
                    {blocks.map((block) => (
                      <option key={block._id} value={block._id}>{block.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Week Start Date</label>
                    <input
                      type="date"
                      value={weeklyFormData.weekStartDate}
                      onChange={(e) => setWeeklyFormData({...weeklyFormData, weekStartDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Week End Date</label>
                    <input
                      type="date"
                      value={weeklyFormData.weekEndDate}
                      onChange={(e) => setWeeklyFormData({...weeklyFormData, weekEndDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Activities</label>
                    <input
                      type="number"
                      value={weeklyFormData.totalActivities}
                      onChange={(e) => setWeeklyFormData({...weeklyFormData, totalActivities: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Participation Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={weeklyFormData.participationRate}
                      onChange={(e) => setWeeklyFormData({...weeklyFormData, participationRate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Incidents Count</label>
                    <input
                      type="number"
                      min="0"
                      value={weeklyFormData.incidentsCount}
                      onChange={(e) => setWeeklyFormData({...weeklyFormData, incidentsCount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disciplinary Actions</label>
                  <textarea
                    value={weeklyFormData.disciplinaryActions}
                    onChange={(e) => setWeeklyFormData({...weeklyFormData, disciplinaryActions: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="List any disciplinary actions taken this week..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Positive Events</label>
                  <textarea
                    value={weeklyFormData.positiveEvents}
                    onChange={(e) => setWeeklyFormData({...weeklyFormData, positiveEvents: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Highlight positive events and achievements..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Concerns</label>
                  <textarea
                    value={weeklyFormData.concerns}
                    onChange={(e) => setWeeklyFormData({...weeklyFormData, concerns: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Any concerns or issues that need attention..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                  <textarea
                    value={weeklyFormData.recommendations}
                    onChange={(e) => setWeeklyFormData({...weeklyFormData, recommendations: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="Recommendations for improvements or changes..."
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Create Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {activeTab === 'incidents' ? 'Incident' : 'Weekly Activity'} Report Details
            </h3>
            
            <div className="space-y-4">
              {activeTab === 'incidents' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Incident Type</label>
                      <p className="text-gray-900">{selectedReport.incidentType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Severity</label>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        selectedReport.severity === 'high' ? 'bg-red-100 text-red-800' :
                        selectedReport.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {selectedReport.severity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Block</label>
                      <p className="text-gray-900">{selectedReport.block?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="text-gray-900">{new Date(selectedReport.incidentDate).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.description}</p>
                  </div>
                  
                  {selectedReport.prisonersInvolved && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prisoners Involved</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.prisonersInvolved}</p>
                    </div>
                  )}
                  
                  {selectedReport.actionTaken && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Action Taken</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.actionTaken}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Block</label>
                      <p className="text-gray-900">{selectedReport.block?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Week Period</label>
                      <p className="text-gray-900">
                        {new Date(selectedReport.weekStartDate).toLocaleDateString()} - {new Date(selectedReport.weekEndDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Activities</label>
                      <p className="text-gray-900">{selectedReport.totalActivities || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Participation Rate</label>
                      <p className="text-gray-900">{selectedReport.participationRate || 0}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Incidents Count</label>
                      <p className="text-gray-900">{selectedReport.incidentsCount || 0}</p>
                    </div>
                  </div>
                  
                  {selectedReport.disciplinaryActions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Disciplinary Actions</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.disciplinaryActions}</p>
                    </div>
                  )}
                  
                  {selectedReport.positiveEvents && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Positive Events</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.positiveEvents}</p>
                    </div>
                  )}
                  
                  {selectedReport.concerns && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Concerns</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.concerns}</p>
                    </div>
                  )}
                  
                  {selectedReport.recommendations && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.recommendations}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ActivityReports;
