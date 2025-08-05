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
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status.toLowerCase() === filterStatus.toLowerCase();
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
          alert('✅ Leave request approved successfully');
          fetchRequests(); // Refresh the list
        } else {
          alert(`❌ ${data.msg || 'Failed to approve request'}`);
        }
      } else {
        alert('❌ Failed to approve request');
      }
    } catch (error) {
      console.error('Approve request error:', error);
      // Fallback to local state update
      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: 'Approved' } : req
      ));
      alert('✅ Leave request approved (offline mode)');
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
          alert('✅ Leave request rejected successfully');
          fetchRequests(); // Refresh the list
        } else {
          alert(`❌ ${data.msg || 'Failed to reject request'}`);
        }
      } else {
        alert('❌ Failed to reject request');
      }
    } catch (error) {
      console.error('Reject request error:', error);
      // Fallback to local state update
      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: 'Rejected' } : req
      ));
      alert('✅ Leave request rejected (offline mode)');
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
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
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
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                          <div className="text-sm text-gray-500">ID: {request.employeeId}</div>
                          <div className="text-sm text-gray-500">{request.department} - {request.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getLeaveTypeColor(request.leaveType)}>
                          {request.leaveType}
                        </span>
                        <div className="text-sm text-gray-900">{request.reason}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          Applied: {new Date(request.appliedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <FaClock className="mr-1" />
                        {request.days} day(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.coveringStaff}</div>
                      <div className="text-sm text-gray-500">Emergency: {request.emergencyContact}</div>
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
                        <button className="text-indigo-600 hover:text-indigo-900">
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
    </WardenLayout>
  );
};

export default LeaveRequests;
