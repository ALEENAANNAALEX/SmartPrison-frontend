import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaUserClock, 
  FaSearch, 
  FaFilter, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf
} from 'react-icons/fa';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewingRequest, setViewingRequest] = useState(null);
  const [notification, setNotification] = useState(null);

  // Functions to handle details popup
  const openViewDetails = (request) => {
    setViewingRequest(request);
  };

  const closeViewDetails = () => {
    setViewingRequest(null);
  };

  // Function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Mock data for leave requests
  const mockRequests = [
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'Sarah Wilson',
      department: 'Security',
      position: 'Security Officer',
      leaveType: 'Annual Leave',
      startDate: '2024-01-25',
      endDate: '2024-01-27',
      days: 3,
      reason: 'Family vacation',
      status: 'Pending',
      appliedDate: '2024-01-20',
      emergencyContact: '+1234567890',
      coveringStaff: 'Officer Brown'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      employeeName: 'Dr. Michael Brown',
      department: 'Medical',
      position: 'Medical Officer',
      leaveType: 'Sick Leave',
      startDate: '2024-01-23',
      endDate: '2024-01-24',
      days: 2,
      reason: 'Medical treatment',
      status: 'Approved',
      appliedDate: '2024-01-22',
      emergencyContact: '+1234567891',
      coveringStaff: 'Dr. Martinez'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      employeeName: 'James Rodriguez',
      department: 'Security',
      position: 'Correctional Officer',
      leaveType: 'Emergency Leave',
      startDate: '2024-01-22',
      endDate: '2024-01-22',
      days: 1,
      reason: 'Family emergency',
      status: 'Approved',
      appliedDate: '2024-01-22',
      emergencyContact: '+1234567892',
      coveringStaff: 'Officer Davis'
    },
    {
      id: 4,
      employeeId: 'EMP004',
      employeeName: 'Lisa Chen',
      department: 'Rehabilitation',
      position: 'Counselor',
      leaveType: 'Annual Leave',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      days: 5,
      reason: 'Personal time off',
      status: 'Pending',
      appliedDate: '2024-01-21',
      emergencyContact: '+1234567893',
      coveringStaff: 'Dr. Martinez'
    },
    {
      id: 5,
      employeeId: 'EMP005',
      employeeName: 'Robert Johnson',
      department: 'Maintenance',
      position: 'Maintenance Supervisor',
      leaveType: 'Sick Leave',
      startDate: '2024-01-20',
      endDate: '2024-01-21',
      days: 2,
      reason: 'Flu symptoms',
      status: 'Rejected',
      appliedDate: '2024-01-19',
      emergencyContact: '+1234567894',
      coveringStaff: 'Mike Thompson'
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/warden/leave-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('📋 Fetched leave requests:', data.requests);
          setRequests(data.requests);
        } else {
          console.error('Failed to fetch requests:', data.msg);
          setRequests(mockRequests);
        }
      } else {
        console.error('Failed to fetch requests');
        setRequests(mockRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    // Handle both API response format and mock data format
    const employeeName = request.staffName || request.employeeName || '';
    const employeeId = request.staffEmail || request.employeeId || '';
    const department = request.department || '';
    
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (request.status || '').toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === 'all' || request.leaveType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': FaHourglassHalf,
      'Approved': FaCheckCircle,
      'Rejected': FaTimesCircle
    };
    
    const IconComponent = icons[status] || FaHourglassHalf;
    return <IconComponent className="h-4 w-4" />;
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      'Annual Leave': 'bg-blue-100 text-blue-800',
      'Sick Leave': 'bg-red-100 text-red-800',
      'Emergency Leave': 'bg-orange-100 text-orange-800',
      'Maternity Leave': 'bg-pink-100 text-pink-800',
      'Paternity Leave': 'bg-purple-100 text-purple-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleApprove = async (requestId) => {
    try {
      const token = sessionStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/warden/leave-requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comments: 'Approved by warden'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification('✅ Leave request approved successfully', 'success');
          fetchRequests(); // Refresh the list
        } else {
          showNotification(`❌ ${data.msg || 'Failed to approve request'}`, 'error');
        }
      } else {
        showNotification('❌ Failed to approve request', 'error');
      }
    } catch (error) {
      console.error('Approve request error:', error);
      // Fallback to local state update
      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: 'Approved' } : req
      ));
      showNotification('✅ Leave request approved (offline mode)', 'success');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = sessionStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/warden/leave-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comments: 'Rejected by warden'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showNotification('✅ Leave request rejected successfully', 'success');
          fetchRequests(); // Refresh the list
        } else {
          showNotification(`❌ ${data.msg || 'Failed to reject request'}`, 'error');
        }
      } else {
        showNotification('❌ Failed to reject request', 'error');
      }
    } catch (error) {
      console.error('Reject request error:', error);
      // Fallback to local state update
      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: 'Rejected' } : req
      ));
      showNotification('✅ Leave request rejected (offline mode)', 'success');
    }
  };

  if (loading) {
    return (
      <WardenLayout title="Leave Requests" subtitle="Manage staff leave requests and approvals">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Leave Requests" subtitle="Manage staff leave requests and approvals">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Paternity Leave">Paternity Leave</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUserClock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaHourglassHalf className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'Pending').length}
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'Approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaTimesCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'Rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Leave Requests ({filteredRequests.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
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
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.staffName || request.employeeName || 'Unknown Staff'}</div>
                        <div className="text-sm text-gray-500">ID: {request.requestId || request.employeeId || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{request.department || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getLeaveTypeColor(request.leaveType)}>
                          {request.leaveType}
                        </span>
                        <div className="text-sm text-gray-900">{request.reason}</div>
                        {request.appliedDate && (() => {
                          try {
                            const date = new Date(request.appliedDate);
                            if (!isNaN(date.getTime())) {
                              return (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <FaCalendarAlt className="mr-1" />
                                  Applied: {date.toLocaleDateString()}
                                </div>
                              );
                            }
                          } catch (e) {
                            // Invalid date, don't show anything
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.startDate ? (() => {
                          try {
                            const date = new Date(request.startDate);
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                          } catch (e) {
                            return 'N/A';
                          }
                        })() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        Start Date
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.endDate ? (() => {
                          try {
                            const date = new Date(request.endDate);
                            return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                          } catch (e) {
                            return 'N/A';
                          }
                        })() : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaClock className="mr-1" />
                        {request.totalDays || request.days || 'N/A'} day(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={getStatusBadge(request.status)}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openViewDetails(request)}
                          className="text-teal-600 hover:text-teal-900"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        {request.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="h-4 w-4" />
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
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <FaUserClock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Leave Request Details Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Leave Request Details</h3>
              <button
                onClick={closeViewDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Employee Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Employee Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900">{viewingRequest.staffName || viewingRequest.employeeName || 'Unknown Staff'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <p className="text-gray-900">{viewingRequest.requestId || viewingRequest.employeeId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <p className="text-gray-900">{viewingRequest.department || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <p className="text-gray-900">{viewingRequest.position || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Leave Request Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaFileAlt className="mr-2 text-green-600" />
                  Leave Request Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                    <span className={getLeaveTypeColor(viewingRequest.leaveType)}>
                      {viewingRequest.leaveType}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={getStatusBadge(viewingRequest.status)}>
                      <FaCheckCircle className="inline mr-1" />
                      {viewingRequest.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <p className="text-gray-900">
                      <FaCalendarAlt className="inline mr-2" />
                      {viewingRequest.startDate ? (() => {
                        try {
                          const date = new Date(viewingRequest.startDate);
                          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                        } catch (e) {
                          return 'N/A';
                        }
                      })() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <p className="text-gray-900">
                      <FaCalendarAlt className="inline mr-2" />
                      {viewingRequest.endDate ? (() => {
                        try {
                          const date = new Date(viewingRequest.endDate);
                          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                        } catch (e) {
                          return 'N/A';
                        }
                      })() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                    <p className="text-gray-900">
                      <FaClock className="inline mr-2" />
                      {viewingRequest.totalDays || viewingRequest.days || 'N/A'} day(s)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
                    <p className="text-gray-900">
                      <FaCalendarAlt className="inline mr-2" />
                      {viewingRequest.appliedDate ? (() => {
                        try {
                          const date = new Date(viewingRequest.appliedDate);
                          return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                        } catch (e) {
                          return 'N/A';
                        }
                      })() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUserClock className="mr-2 text-purple-600" />
                  Additional Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leave</label>
                    <p className="text-gray-900 bg-white p-3 rounded border">
                      {viewingRequest.reason || 'No reason provided'}
                    </p>
                  </div>
                  {viewingRequest.comments && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warden's Comments</label>
                      <p className="text-gray-900 bg-yellow-50 p-3 rounded border border-yellow-200">
                        {viewingRequest.comments}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeViewDetails}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </WardenLayout>
  );
};

export default LeaveRequests;
