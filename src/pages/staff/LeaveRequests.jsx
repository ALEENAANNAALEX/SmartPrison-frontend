import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaFilter, 
  FaPlus,
  FaEye, 
  FaEdit,
  FaSave,
  FaTimes,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle
} from 'react-icons/fa';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Leave request form data
  const [requestForm, setRequestForm] = useState({
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Mock leave requests data
  const mockRequests = [
    {
      id: 1,
      requestId: 'LR001',
      leaveType: 'Annual Leave',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      totalDays: 5,
      reason: 'Family vacation',
      emergencyContact: 'John Doe - +1234567890',
      coverageArrangement: 'Officer Smith will cover my shifts',
      additionalNotes: 'Pre-planned vacation with family',
      status: 'Approved',
      submittedDate: '2024-01-15',
      approvedBy: 'Warden Johnson',
      approvedDate: '2024-01-16'
    },
    {
      id: 2,
      requestId: 'LR002',
      leaveType: 'Sick Leave',
      startDate: '2024-01-25',
      endDate: '2024-01-26',
      totalDays: 2,
      reason: 'Medical appointment and recovery',
      emergencyContact: 'Jane Smith - +1234567891',
      coverageArrangement: 'Officer Brown available for coverage',
      additionalNotes: 'Doctor appointment scheduled',
      status: 'Pending',
      submittedDate: '2024-01-20',
      approvedBy: null,
      approvedDate: null
    },
    {
      id: 3,
      requestId: 'LR003',
      leaveType: 'Emergency Leave',
      startDate: '2024-01-22',
      endDate: '2024-01-22',
      totalDays: 1,
      reason: 'Family emergency',
      emergencyContact: 'Emergency Contact - +1234567892',
      coverageArrangement: 'Supervisor notified, backup arranged',
      additionalNotes: 'Urgent family matter',
      status: 'Rejected',
      submittedDate: '2024-01-21',
      approvedBy: 'Warden Johnson',
      approvedDate: '2024-01-21'
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Format date as YYYY-MM-DD for input[type=date]
  const formatDateInput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Compute tomorrow in YYYY-MM-DD
  const getTomorrowString = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return formatDateInput(t);
  };

  // Compute max selectable date = today + 6 months
  const getMaxDateString = () => {
    const d = new Date();
    const month = d.getMonth();
    // Add 6 months, handle year overflow automatically
    d.setMonth(month + 6);
    return formatDateInput(d);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalDays = calculateDays(requestForm.startDate, requestForm.endDate);
      const token = sessionStorage.getItem('token');

      if (!token) {
        setNotification({
          type: 'error',
          message: '❌ No authentication token found. Please log in again.'
        });
        setTimeout(() => setNotification(null), 5000);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/staff/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          leaveType: requestForm.leaveType,
          startDate: requestForm.startDate,
          endDate: requestForm.endDate,
          totalDays: totalDays,
          reason: requestForm.reason
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotification({
            type: 'success',
            message: `✅ Leave request submitted successfully. ID: ${data.request.requestId}`
          });

          // Refresh the requests list
          fetchRequests();

          // Reset form
          setRequestForm({
            leaveType: 'Annual Leave',
            startDate: '',
            endDate: '',
            reason: ''
          });
          setShowRequestModal(false);
        } else {
          setNotification({
            type: 'error',
            message: `❌ ${data.msg || 'Failed to submit leave request'}`
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({ msg: 'Unknown error' }));
        console.error('Leave request error:', errorData);
        
        if (response.status === 401) {
          setNotification({
            type: 'error',
            message: '❌ Authentication failed. Please log in again.'
          });
        } else {
          setNotification({
            type: 'error',
            message: `❌ ${errorData.msg || 'Failed to submit leave request. Please try again.'}`
          });
        }
      }

      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      console.error('Submit request error:', error);
      setNotification({
        type: 'error',
        message: '❌ Network error. Please check your connection and try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/staff/leave-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRequests(data.requests);
        } else {
          console.error('Failed to fetch requests:', data.msg);
          // Fallback to mock data
          setRequests(mockRequests);
        }
      } else {
        console.error('Failed to fetch requests');
        // Fallback to mock data
        setRequests(mockRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Fallback to mock data
      setRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getLeaveTypeBadge = (type) => {
    const typeColors = {
      'Annual Leave': 'bg-blue-100 text-blue-800',
      'Sick Leave': 'bg-orange-100 text-orange-800',
      'Emergency Leave': 'bg-red-100 text-red-800',
      'Personal Leave': 'bg-purple-100 text-purple-800',
      'Maternity Leave': 'bg-pink-100 text-pink-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <StaffLayout title="Leave Requests" subtitle="Submit and track your leave requests">
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
          </div>
          
          <button 
            onClick={() => {
              // Default dates when opening modal: tomorrow for both start and end
              const tomorrow = getTomorrowString();
              setRequestForm({
                leaveType: 'Annual Leave',
                startDate: tomorrow,
                endDate: tomorrow,
                reason: ''
              });
              setShowRequestModal(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            New Leave Request
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
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
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
              My Leave Requests ({filteredRequests.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.requestId || request.id || request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">ID: {request.requestId}</div>
                        <div className="text-sm text-gray-500">{request.totalDays} day(s)</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <div>
                          <div>{new Date(request.startDate).toLocaleDateString()}</div>
                          <div className="text-gray-500">to {new Date(request.endDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getLeaveTypeBadge(request.leaveType)}>
                          {request.leaveType}
                        </span>
                        <div className="text-sm text-gray-900 truncate max-w-xs">{request.reason}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                      {request.approvedBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          by {request.approvedBy}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(request.submittedDate).toLocaleDateString()}
                      </div>
                      {request.approvedDate && (
                        <div className="text-xs text-gray-500">
                          Processed: {new Date(request.approvedDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => console.log(`Viewing details for request ${request.requestId}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        {request.status === 'Pending' && (
                          <button 
                            onClick={() => console.log(`Editing request ${request.requestId}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
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
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Leave Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Submit Leave Request</h3>
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
                  <select
                    value={requestForm.leaveType}
                    onChange={(e) => setRequestForm({...requestForm, leaveType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Days: {calculateDays(requestForm.startDate, requestForm.endDate)}
                  </label>
                  <div className="text-sm text-gray-500 mt-2">
                    Calculated automatically based on start and end dates
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={requestForm.startDate}
                    min={getTomorrowString()}
                    max={getMaxDateString()}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setRequestForm(prev => {
                        const endOkay = prev.endDate && new Date(prev.endDate) >= new Date(newStart);
                        let nextEnd = endOkay ? prev.endDate : newStart;
                        // Clamp end date to max window
                        const maxStr = getMaxDateString();
                        if (nextEnd && new Date(nextEnd) > new Date(maxStr)) {
                          nextEnd = maxStr;
                        }
                        return { ...prev, startDate: newStart, endDate: nextEnd };
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                  <input
                    type="date"
                    value={requestForm.endDate}
                    min={requestForm.startDate || getTomorrowString()}
                    max={getMaxDateString()}
                    onChange={(e) => setRequestForm({...requestForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave *</label>
                <textarea
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Please provide a detailed reason for your leave request..."
                  required
                />
              </div>              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default LeaveRequests;
