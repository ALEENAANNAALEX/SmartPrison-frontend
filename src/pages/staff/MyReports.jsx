import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { 
  FaFileAlt, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaDownload,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock reports data
  const mockReports = [
    {
      id: 1,
      reportId: 'RPT001',
      title: 'Weekly Behavior Assessment Report',
      type: 'Behavior Report',
      description: 'Weekly assessment of inmate behavior patterns and improvements',
      generatedDate: '2024-01-21',
      period: 'Week of Jan 15-21, 2024',
      status: 'Completed',
      fileSize: '2.3 MB',
      format: 'PDF'
    },
    {
      id: 2,
      reportId: 'RPT002',
      title: 'Incident Summary Report',
      type: 'Incident Report',
      description: 'Summary of all incidents reported during the month',
      generatedDate: '2024-01-20',
      period: 'January 2024',
      status: 'Completed',
      fileSize: '1.8 MB',
      format: 'PDF'
    },
    {
      id: 3,
      reportId: 'RPT003',
      title: 'Counseling Sessions Summary',
      type: 'Counseling Report',
      description: 'Summary of all counseling sessions conducted',
      generatedDate: '2024-01-19',
      period: 'Week of Jan 15-19, 2024',
      status: 'Completed',
      fileSize: '1.2 MB',
      format: 'PDF'
    },
    {
      id: 4,
      reportId: 'RPT004',
      title: 'Attendance Report',
      type: 'Attendance Report',
      description: 'Staff attendance and duty hours report',
      generatedDate: '2024-01-18',
      period: 'January 1-15, 2024',
      status: 'Processing',
      fileSize: '0.9 MB',
      format: 'PDF'
    }
  ];

  useEffect(() => {
    setReports(mockReports);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'Completed': 'bg-green-100 text-green-800',
      'Processing': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800',
      'Pending': 'bg-blue-100 text-blue-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      'Behavior Report': 'bg-purple-100 text-purple-800',
      'Incident Report': 'bg-red-100 text-red-800',
      'Counseling Report': 'bg-blue-100 text-blue-800',
      'Attendance Report': 'bg-green-100 text-green-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <StaffLayout title="My Reports" subtitle="View and download your generated reports">
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
              <option value="Behavior Report">Behavior Report</option>
              <option value="Incident Report">Incident Report</option>
              <option value="Counseling Report">Counseling Report</option>
              <option value="Attendance Report">Attendance Report</option>
            </select>
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
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reports.filter(r => r.status === 'Processing').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaFileAlt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              My Reports ({filteredReports.length})
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
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
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">ID: {report.reportId}</div>
                        <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                          {report.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getTypeBadge(report.type)}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.period}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <div>
                          <div>{new Date(report.generatedDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">{report.fileSize} • {report.format}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(report.status)}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert(`Viewing report ${report.title}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Report"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        {report.status === 'Completed' && (
                          <button 
                            onClick={() => alert(`Downloading ${report.title}`)}
                            className="text-green-600 hover:text-green-900"
                            title="Download Report"
                          >
                            <FaDownload className="h-4 w-4" />
                          </button>
                        )}
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

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Report Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Weekly Behavior Assessment Report completed</p>
                <p className="text-sm text-gray-500">Generated on January 21, 2024</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaFileAlt className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Incident Summary Report generated</p>
                <p className="text-sm text-gray-500">Generated on January 20, 2024</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaClock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Attendance Report is being processed</p>
                <p className="text-sm text-gray-500">Started on January 18, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default MyReports;
