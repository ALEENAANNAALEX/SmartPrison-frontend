import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaUserTie, 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaUserCheck,
  FaUserClock,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaBadge,
  FaClock
} from 'react-icons/fa';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for staff
  const mockStaff = [
    {
      id: 1,
      employeeId: 'EMP001',
      name: 'Sarah Wilson',
      position: 'Security Officer',
      department: 'Security',
      email: 'sarah.wilson@prison.gov',
      phone: '+1234567890',
      status: 'Active',
      shift: 'Day',
      joinDate: '2022-01-15',
      experience: '5 years',
      assignedBlock: 'Block A',
      lastLogin: '2024-01-20 09:30'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      name: 'Dr. Michael Brown',
      position: 'Medical Officer',
      department: 'Medical',
      email: 'michael.brown@prison.gov',
      phone: '+1234567891',
      status: 'Active',
      shift: 'Day',
      joinDate: '2021-06-20',
      experience: '8 years',
      assignedBlock: 'Medical Wing',
      lastLogin: '2024-01-20 08:15'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      name: 'James Rodriguez',
      position: 'Correctional Officer',
      department: 'Security',
      email: 'james.rodriguez@prison.gov',
      phone: '+1234567892',
      status: 'On Leave',
      shift: 'Night',
      joinDate: '2023-03-10',
      experience: '2 years',
      assignedBlock: 'Block B',
      lastLogin: '2024-01-18 22:45'
    },
    {
      id: 4,
      employeeId: 'EMP004',
      name: 'Lisa Chen',
      position: 'Rehabilitation Counselor',
      department: 'Rehabilitation',
      email: 'lisa.chen@prison.gov',
      phone: '+1234567893',
      status: 'Active',
      shift: 'Day',
      joinDate: '2022-09-05',
      experience: '3 years',
      assignedBlock: 'Counseling Center',
      lastLogin: '2024-01-20 10:20'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStaff(mockStaff);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || member.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-red-100 text-red-800',
      'Training': 'bg-blue-100 text-blue-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getShiftBadge = (shift) => {
    const shiftColors = {
      'Day': 'bg-blue-100 text-blue-800',
      'Night': 'bg-purple-100 text-purple-800',
      'Evening': 'bg-orange-100 text-orange-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${shiftColors[shift] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <WardenLayout title="Staff Management" subtitle="Manage prison staff and personnel">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Staff Management" subtitle="Manage prison staff and personnel">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="Security">Security</option>
              <option value="Medical">Medical</option>
              <option value="Rehabilitation">Rehabilitation</option>
              <option value="Administration">Administration</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on leave">On Leave</option>
              <option value="inactive">Inactive</option>
              <option value="training">Training</option>
            </select>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <FaPlus className="mr-2" />
            Add New Staff
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUserTie className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaUserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.status === 'Active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaUserClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.status === 'On Leave').length}
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
                <p className="text-sm font-medium text-gray-600">Night Shift</p>
                <p className="text-2xl font-bold text-gray-900">
                  {staff.filter(s => s.shift === 'Night').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Staff Members ({filteredStaff.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaBadge className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">ID: {member.employeeId}</div>
                          <div className="text-sm text-gray-500">{member.experience} experience</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.position}</div>
                      <div className="text-sm text-gray-500">{member.department}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <FaCalendarAlt className="mr-1" />
                        Joined: {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaPhone className="mr-2 text-gray-400" />
                        {member.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getStatusBadge(member.status)}>
                          {member.status}
                        </span>
                        <div>
                          <span className={getShiftBadge(member.shift)}>
                            {member.shift} Shift
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.assignedBlock}</div>
                      <div className="text-xs text-gray-500">
                        Last login: {member.lastLogin}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <FaUserTie className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No staff members found</h3>
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

export default StaffManagement;
