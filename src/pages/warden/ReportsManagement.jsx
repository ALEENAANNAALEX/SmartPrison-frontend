import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaFileAlt, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaDownload,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaChartLine
} from 'react-icons/fa';

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for reports
  const mockReports = [
    {
      id: 1,
      title: 'Daily Security Report',
      type: 'Security',
      description: 'Daily security incidents and observations',
      author: 'Officer Wilson',
      date: '2024-01-22',
      status: 'Completed',
      priority: 'High',
      location: 'Block A',
      incidentCount: 2,
      lastModified: '2024-01-22 18:30'
    },
    {
      id: 2,
      title: 'Medical Emergency Report',
      type: 'Medical',
      description: 'Inmate medical emergency in Block B',
      author: 'Dr. Brown',
      date: '2024-01-22',
      status: 'Under Review',
      priority: 'Critical',
      location: 'Block B',
      incidentCount: 1,
      lastModified: '2024-01-22 14:15'
    },
    {
      id: 3,
      title: 'Weekly Behavioral Assessment',
      type: 'Behavioral',
      description: 'Weekly assessment of inmate behavior patterns',
      author: 'Lisa Chen',
      date: '2024-01-21',
      status: 'Draft',
      priority: 'Medium',
      location: 'All Blocks',
      incidentCount: 0,
      lastModified: '2024-01-21 16:45'
    },
    {
      id: 4,
      title: 'Facility Maintenance Report',
      type: 'Maintenance',
      description: 'Monthly facility maintenance and repairs',
      author: 'Mike Johnson',
      date: '2024-01-20',
      status: 'Completed',
      priority: 'Low',
      location: 'Facility Wide',
      incidentCount: 5,
      lastModified: '2024-01-20 12:00'
    },
    {
      id: 5,
      title: 'Incident Report - Fight',
      type: 'Incident',
      description: 'Physical altercation between inmates',
      author: 'Officer Rodriguez',
      date: '2024-01-22',
      status: 'Pending Review',
      priority: 'High',
      location: 'Recreation Yard',
      incidentCount: 1,
      lastModified: '2024-01-22 11:30'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status.toLowerCase().replace(' ', '') === filterStatus.toLowerCase();
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'Completed': 'bg-green-100 text-green-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Pending Review': 'bg-orange-100 text-orange-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'Critical': 'bg-red-100 text-red-800 border-red-200',
      'High': 'bg-orange-100 text-orange-800 border-orange-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[priority] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Security': FaExclamationTriangle,
      'Medical': FaCheckCircle,
      'Behavioral': FaUser,
      'Maintenance': FaFileAlt,
      'Incident': FaExclamationTriangle
    };
    
    const IconComponent = icons[type] || FaFileAlt;
    return <IconComponent className="h-5 w-5" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      'Security': 'text-red-600 bg-red-100',
      'Medical': 'text-green-600 bg-green-100',
      'Behavioral': 'text-blue-600 bg-blue-100',
      'Maintenance': 'text-gray-600 bg-gray-100',
      'Incident': 'text-orange-600 bg-orange-100'
    };
    
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <WardenLayout title="Reports Management" subtitle="Manage and review all facility reports">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Reports Management" subtitle="Manage and review all facility reports">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
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
              <option value="Behavioral">Behavioral</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Incident">Incident</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="underreview">Under Review</option>
              <option value="pendingreview">Pending Review</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <FaChartLine className="mr-2" />
              Analytics
            </button>
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <FaPlus className="mr-2" />
              New Report
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaFileAlt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status.includes('Review')).length}
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
                <p className="text-sm font-medium text-gray-600">Critical Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.priority === 'Critical').length}
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
                  {reports.filter(r => r.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Reports ({filteredReports.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author & Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${getTypeColor(report.type)}`}>
                          {getTypeIcon(report.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.title}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Type: {report.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <FaUser className="mr-2 text-gray-400" />
                        {report.author}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {new Date(report.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Modified: {report.lastModified}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={getStatusBadge(report.status)}>
                          {report.status}
                        </span>
                        <div>
                          <span className={getPriorityBadge(report.priority)}>
                            {report.priority}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.location}</div>
                      {report.incidentCount > 0 && (
                        <div className="text-xs text-gray-500">
                          {report.incidentCount} incident(s)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <FaDownload className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </WardenLayout>
  );
};

export default ReportsManagement;
