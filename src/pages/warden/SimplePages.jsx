import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaChartLine,
  FaUserTie,
  FaUserClock,
  FaFileAlt,
  FaGavel,
  FaHeartbeat,
  FaPlus,
  FaEye,
  FaEdit,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

// Simple Inmates Page
export const InmatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInmates();
  }, []);

  const fetchInmates = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/warden/inmates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.inmates)) {
          setInmates(data.inmates);
        }
      }
    } catch (error) {
      console.error('Error fetching inmates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WardenLayout title="Inmates Management" subtitle="Manage and monitor all inmates">
      <div className="space-y-6">
        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search inmates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <FaUsers className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Inmates</p>
                <p className="text-2xl font-bold">{loading ? '...' : inmates.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <FaUsers className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{loading ? '...' : inmates.filter(i => i.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <FaUsers className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Medical</p>
                <p className="text-2xl font-bold">{loading ? '...' : inmates.filter(i => i.status === 'medical').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Inmates List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading inmates...</p>
                    </td>
                  </tr>
                ) : inmates.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-600">
                      No inmates found in the database.
                    </td>
                  </tr>
                ) : (
                  inmates.filter(inmate => {
                    const fullName = inmate.fullName || [inmate.firstName, inmate.middleName, inmate.lastName].filter(Boolean).join(' ');
                    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
                  }).map((inmate) => {
                    const fullName = inmate.fullName || [inmate.firstName, inmate.middleName, inmate.lastName].filter(Boolean).join(' ') || 'Unknown';
                    return (
                      <tr key={inmate._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {inmate.currentBlock?.name || 'Unknown Block'} - Cell {inmate.cellNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            inmate.status === 'active' ? 'bg-green-100 text-green-800' : 
                            inmate.status === 'medical' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inmate.status?.charAt(0).toUpperCase() + inmate.status?.slice(1) || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                            <FaEye />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WardenLayout>
  );
};

// Simple Schedule Page
export const SchedulePage = () => {
  const mockSchedules = [
    { id: 1, title: 'Morning Security Patrol', time: '06:00 - 08:00', location: 'All Blocks', status: 'Scheduled' },
    { id: 2, title: 'Medical Checkup', time: '09:00 - 12:00', location: 'Block A', status: 'In Progress' },
    { id: 3, title: 'Rehabilitation Session', time: '14:00 - 16:00', location: 'Counseling Center', status: 'Scheduled' }
  ];

  return (
    <WardenLayout title="Daily Schedule" subtitle="Manage daily activities and schedules">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Today's Schedule</h2>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <FaPlus className="mr-2" />
            Add Schedule
          </button>
        </div>

        <div className="grid gap-4">
          {mockSchedules.map((schedule) => (
            <div key={schedule.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
                  <p className="text-gray-600 flex items-center mt-1">
                    <FaCalendarAlt className="mr-2" />
                    {schedule.time}
                  </p>
                  <p className="text-gray-600 mt-1">{schedule.location}</p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  schedule.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {schedule.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WardenLayout>
  );
};

// Simple Staff Management Page
export const StaffPage = () => {
  const mockStaff = [
    { id: 1, name: 'Sarah Wilson', position: 'Security Officer', department: 'Security', status: 'Active' },
    { id: 2, name: 'Dr. Michael Brown', position: 'Medical Officer', department: 'Medical', status: 'Active' },
    { id: 3, name: 'James Rodriguez', position: 'Correctional Officer', department: 'Security', status: 'On Leave' }
  ];

  return (
    <WardenLayout title="Staff Management" subtitle="Manage staff members and assignments">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <FaUserTie className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{mockStaff.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <FaUserTie className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{mockStaff.filter(s => s.status === 'Active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <FaUserTie className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-2xl font-bold">{mockStaff.filter(s => s.status === 'On Leave').length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Staff Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{staff.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{staff.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{staff.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <FaEye />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WardenLayout>
  );
};

// Simple placeholder pages for other menu items
export const BehaviorAnalyticsPage = () => (
  <WardenLayout title="Behavior Analytics" subtitle="Monitor inmate behavior patterns">
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <FaChartLine className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Behavior Analytics</h3>
      <p className="text-gray-600">Comprehensive behavior tracking and analytics dashboard coming soon.</p>
    </div>
  </WardenLayout>
);

export const LeaveRequestsPage = () => (
  <WardenLayout title="Leave Requests" subtitle="Manage staff leave requests">
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <FaUserClock className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Leave Requests</h3>
      <p className="text-gray-600">Staff leave request management system.</p>
    </div>
  </WardenLayout>
);

export const ReportsPage = () => (
  <WardenLayout title="Reports" subtitle="Generate and view reports">
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <FaFileAlt className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Reports</h3>
      <p className="text-gray-600">Comprehensive reporting system for all facility operations.</p>
    </div>
  </WardenLayout>
);

export const ParoleRequestsPage = () => (
  <WardenLayout title="Parole Requests" subtitle="Review parole applications">
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <FaGavel className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Parole Requests</h3>
      <p className="text-gray-600">Review and process inmate parole applications.</p>
    </div>
  </WardenLayout>
);

export const RehabilitationPage = () => (
  <WardenLayout title="Rehabilitation Programs" subtitle="Manage rehabilitation programs">
    <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
      <FaHeartbeat className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">Rehabilitation Programs</h3>
      <p className="text-gray-600">Comprehensive rehabilitation and counseling programs.</p>
    </div>
  </WardenLayout>
);
