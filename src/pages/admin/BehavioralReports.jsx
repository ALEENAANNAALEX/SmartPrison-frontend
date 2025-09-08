import React, { useState, useEffect } from 'react'; // React core + hooks
import AdminLayout from '../../components/AdminLayout'; // Admin layout wrapper
import { FaFileAlt, FaPlus, FaEye, FaCheck, FaTimes, FaSearch, FaFilter } from 'react-icons/fa'; // Icons for reports UI

// Section: Component blueprint
// - State: reports, prisoners, loading flag, modal visibility, selected report
// - Filters: searchTerm, filterStatus, filterType
// - Form: formData for creating a report
// - Effects: load reports and prisoners on mount
// - API: fetch reports, fetch prisoners, create report, review report
// - Render: filters, list/table, details modal, create form modal

const BehavioralReports = () => {
  const [reports, setReports] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    prisoner: '',
    reportType: 'positive',
    description: '',
    severity: 'low',
    actionTaken: '',
    recommendations: ''
  });

  useEffect(() => {
    fetchReports();
    fetchPrisoners();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/reports/behavioral', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReports(data.reports);
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrisoners = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/prisoners', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrisoners(data.prisoners);
        }
      }
    } catch (error) {
      console.error('Error fetching prisoners:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/reports/behavioral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchReports();
        setShowAddModal(false);
        setFormData({
          prisoner: '',
          reportType: 'positive',
          description: '',
          severity: 'low',
          actionTaken: '',
          recommendations: ''
        });
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports/behavioral/${reportId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ reviewStatus: status })
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error reviewing report:', error);
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.prisoner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.prisoner?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.prisoner?.prisonerNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || report.reviewStatus === filterStatus;
    const matchesType = filterType === '' || report.reportType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <AdminLayout title="Behavioral Reports" subtitle="Review and manage prisoner behavioral reports">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Behavioral Reports" subtitle="Review and manage prisoner behavioral reports">
      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaFileAlt className="text-2xl text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Total Reports: {reports.length}</h3>
              <p className="text-gray-600">Behavioral reports in the system</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Create Report
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="incident">Incident</option>
            <option value="disciplinary">Disciplinary</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prisoner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaFileAlt className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {report.prisoner?.firstName} {report.prisoner?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{report.prisoner?.prisonerNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.reportType === 'positive' ? 'bg-green-100 text-green-800' :
                      report.reportType === 'negative' ? 'bg-red-100 text-red-800' :
                      report.reportType === 'incident' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {report.reportType}
                    </span>
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
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      report.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.reviewStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.reportedBy?.name || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <FaEye />
                      </button>
                      {report.reviewStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleReviewReport(report._id, 'approved')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleReviewReport(report._id, 'rejected')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Behavioral Report</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prisoner</label>
                <select
                  value={formData.prisoner}
                  onChange={(e) => setFormData({...formData, prisoner: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Prisoner</option>
                  {prisoners.map((prisoner) => (
                    <option key={prisoner._id} value={prisoner._id}>
                      {prisoner.firstName} {prisoner.lastName} (#{prisoner.prisonerNumber})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={formData.reportType}
                    onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="positive">Positive Behavior</option>
                    <option value="negative">Negative Behavior</option>
                    <option value="incident">Incident Report</option>
                    <option value="disciplinary">Disciplinary Action</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="4"
                  required
                  placeholder="Describe the behavior or incident in detail..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Taken</label>
                <textarea
                  value={formData.actionTaken}
                  onChange={(e) => setFormData({...formData, actionTaken: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="What action was taken in response to this behavior?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  placeholder="Any recommendations for future handling or follow-up?"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      prisoner: '',
                      reportType: 'positive',
                      description: '',
                      severity: 'low',
                      actionTaken: '',
                      recommendations: ''
                    });
                  }}
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
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Behavioral Report Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prisoner</label>
                  <p className="text-gray-900">
                    {selectedReport.prisoner?.firstName} {selectedReport.prisoner?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">#{selectedReport.prisoner?.prisonerNumber}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-gray-900">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Type</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedReport.reportType === 'positive' ? 'bg-green-100 text-green-800' :
                    selectedReport.reportType === 'negative' ? 'bg-red-100 text-red-800' :
                    selectedReport.reportType === 'incident' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedReport.reportType}
                  </span>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.description}</p>
              </div>
              
              {selectedReport.actionTaken && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Taken</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.actionTaken}</p>
                </div>
              )}
              
              {selectedReport.recommendations && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.recommendations}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reported By</label>
                  <p className="text-gray-900">{selectedReport.reportedBy?.name || 'System'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    selectedReport.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedReport.reviewStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedReport.reviewStatus}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
              {selectedReport.reviewStatus === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleReviewReport(selectedReport._id, 'approved');
                      setSelectedReport(null);
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReviewReport(selectedReport._id, 'rejected');
                      setSelectedReport(null);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BehavioralReports;

// File purpose: Admin page to create, view, filter, and review behavioral reports for prisoners.
// Frontend location: Route /admin/behavioral-reports (Admin > Behavioral Reports) via App.jsx routing.
// Backend endpoints used: GET/POST http://localhost:5000/api/admin/reports/behavioral; PUT /:id/review; GET prisoners from http://localhost:5000/api/admin/prisoners.
// Auth: Requires Bearer token from sessionStorage.
// UI container: AdminLayout; includes modal for details and Tailwind UI table.
