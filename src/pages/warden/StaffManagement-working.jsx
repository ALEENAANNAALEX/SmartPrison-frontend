import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaUserTie, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit,
  FaUserCheck,
  FaUserClock,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaBadge,
  FaClock,
  FaMapMarkerAlt
} from 'react-icons/fa';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterShift, setFilterShift] = useState('all');

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
      shift: 'Day',
      joinDate: '2022-01-15',
      experience: '5 years',
      assignedBlock: 'Block A',
      status: 'Active',
      lastLogin: '2024-01-20 09:30',
      performance: 'Excellent'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      name: 'Dr. Michael Brown',
      position: 'Medical Officer',
      department: 'Medical',
      email: 'michael.brown@prison.gov',
      phone: '+1234567891',
      shift: 'Day',
      joinDate: '2021-06-20',
      experience: '8 years',
      assignedBlock: 'Medical Wing',
      status: 'Active',
      lastLogin: '2024-01-20 08:15',
      performance: 'Excellent'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      name: 'James Rodriguez',
      position: 'Correctional Officer',
      department: 'Security',
      email: 'james.rodriguez@prison.gov',
      phone: '+1234567892',
      shift: 'Night',
      joinDate: '2023-03-10',
      experience: '2 years',
      assignedBlock: 'Block B',
      status: 'Active',
      lastLogin: '2024-01-19 22:45',
      performance: 'Good'
    },
    {
      id: 4,
      employeeId: 'EMP004',
      name: 'Lisa Chen',
      position: 'Rehabilitation Counselor',
      department: 'Rehabilitation',
      email: 'lisa.chen@prison.gov',
      phone: '+1234567893',
      shift: 'Day',
      joinDate: '2022-09-05',
      experience: '3 years',
      assignedBlock: 'Counseling Center',
      status: 'On Leave',
      lastLogin: '2024-01-15 16:20',
      performance: 'Good'
    }
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/warden/staff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('📋 Fetched staff data:', data.staff);
          setStaff(data.staff);
        } else {
          console.error('Failed to fetch staff:', data.msg);
          // Fallback to mock data if API fails
          setStaff(mockStaff);
        }
      } else {
        console.error('Failed to fetch staff, using mock data');
        // Fallback to mock data if API fails
        setStaff(mockStaff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      // Fallback to mock data if API fails
      setStaff(mockStaff);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesShift = filterShift === 'all' || member.shift.toLowerCase() === filterShift.toLowerCase();
    
    return matchesSearch && matchesDepartment && matchesShift;
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

  const getPerformanceBadge = (performance) => {
    const performanceColors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${performanceColors[performance] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <WardenLayout title="Staff Management" subtitle="Manage and monitor all staff members">
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
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Shifts</option>
              <option value="day">Day Shift</option>
              <option value="evening">Evening Shift</option>
              <option value="night">Night Shift</option>
            </select>
          </div>
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
                        <div>
                          <span className={getPerformanceBadge(member.performance)}>
                            {member.performance}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {member.assignedBlock}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last login: {member.lastLogin}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => alert(`Viewing details for ${member.name}`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Editing ${member.name}`)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Staff"
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
