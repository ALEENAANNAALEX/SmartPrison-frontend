import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaUserShield,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaChartBar,
  FaUserPlus,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaEye,
  FaTrash,
  FaBuilding,
  FaUserTie,
  FaFileAlt,
  FaClipboardList,
  FaGavel,
  FaShieldAlt,
  FaHome
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVisits: 0,
    pendingRequests: 0,
    activeInmates: 0,
    totalStaff: 0,
    totalBlocks: 0,
    totalWardens: 0,
    recentIncidents: 0,
    pendingReports: 0,
    blockCapacity: { totalCapacity: 0, currentOccupancy: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [behavioralReports, setBehavioralReports] = useState([]);
  const [incidentReports, setIncidentReports] = useState([]);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [prisonBlocks, setPrisonBlocks] = useState([]);
  const [prisoners, setPrisoners] = useState([]);

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();

    // Auto-enter fullscreen mode (optional - uncomment to enable)
    // const enterFullscreen = () => {
    //   if (!document.fullscreenElement) {
    //     document.documentElement.requestFullscreen().catch(err => {
    //       console.log(`Error attempting to enable fullscreen: ${err.message}`);
    //     });
    //   }
    // };
    // enterFullscreen();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch comprehensive dashboard statistics
      const dashboardStatsResponse = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
        headers
      });

      if (dashboardStatsResponse.ok) {
        const dashboardData = await dashboardStatsResponse.json();
        if (dashboardData.success) {
          setStats(prevStats => ({
            ...prevStats,
            ...dashboardData.stats,
            totalBlocks: dashboardData.stats.totalBlocks,
            totalWardens: dashboardData.stats.totalWardens,
            recentIncidents: dashboardData.stats.recentIncidents,
            pendingReports: dashboardData.stats.pendingReports,
            blockCapacity: dashboardData.stats.blockCapacity[0] || { totalCapacity: 0, currentOccupancy: 0 }
          }));
        }
      }

      // Fetch basic stats (fallback)
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(prevStats => ({ ...prevStats, ...statsData }));
      }

      // Fetch recent activity
      const activityResponse = await fetch('http://localhost:5000/api/admin/recent-activity', {
        headers
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }

      // Fetch pending requests
      const requestsResponse = await fetch('http://localhost:5000/api/admin/pending-requests', {
        headers
      });

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setPendingRequests(requestsData);
      }

      // Fetch behavioral reports
      const behavioralResponse = await fetch('http://localhost:5000/api/admin/reports/behavioral?limit=5', {
        headers
      });

      if (behavioralResponse.ok) {
        const behavioralData = await behavioralResponse.json();
        if (behavioralData.success) {
          setBehavioralReports(behavioralData.reports);
        }
      }

      // Fetch incident reports
      const incidentResponse = await fetch('http://localhost:5000/api/admin/reports/incidents?limit=5', {
        headers
      });

      if (incidentResponse.ok) {
        const incidentData = await incidentResponse.json();
        if (incidentData.success) {
          setIncidentReports(incidentData.reports);
        }
      }

      // Fetch prison blocks
      const blocksResponse = await fetch('http://localhost:5000/api/admin/blocks?limit=10', {
        headers
      });

      if (blocksResponse.ok) {
        const blocksData = await blocksResponse.json();
        if (blocksData.success) {
          setPrisonBlocks(blocksData.blocks);
        }
      }

      // Fetch recent prisoners
      const prisonersResponse = await fetch('http://localhost:5000/api/admin/prisoners?limit=5', {
        headers
      });

      if (prisonersResponse.ok) {
        const prisonersData = await prisonersResponse.json();
        if (prisonersData.success) {
          setPrisoners(prisonersData.prisoners);
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/approve-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reject-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-br from-gray-700 to-gray-800 text-white flex flex-col fixed h-screen shadow-2xl">
        <div className="p-8 border-b border-white/10 text-center">
          <h2 className="text-2xl font-bold mb-1">🏛️ Smart Prison</h2>
          <span className="text-sm opacity-80">Admin</span>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            <li className="px-6 py-3 bg-white/20 border-r-4 border-white flex items-center gap-3 font-medium cursor-pointer">
              <FaHome className="text-lg" /> Dashboard
            </li>

            {/* Prison Management Section */}
            <li className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider border-b border-white/10 mt-4 mb-2">
              Prison Management
            </li>
            <li
              onClick={() => navigate('/admin/blocks')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaBuilding className="text-lg" /> Prison Blocks
            </li>
            <li
              onClick={() => navigate('/admin/wardens')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaUserTie className="text-lg" /> Manage Wardens
            </li>
            <li
              onClick={() => navigate('/admin/prisoners')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaUserShield className="text-lg" /> Add Prisoners
            </li>

            {/* Reports & Monitoring Section */}
            <li className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider border-b border-white/10 mt-4 mb-2">
              Reports & Monitoring
            </li>
            <li
              onClick={() => navigate('/admin/behavioral-reports')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaFileAlt className="text-lg" /> Behavioral Reports
            </li>
            <li
              onClick={() => navigate('/admin/activity-reports')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaClipboardList className="text-lg" /> Activity & Incident Reports
            </li>

            {/* Rules & Policies Section */}
            <li className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider border-b border-white/10 mt-4 mb-2">
              Rules & Policies
            </li>
            <li
              onClick={() => navigate('/admin/visit-rules')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaCalendarCheck className="text-lg" /> Visit & Parole Rules
            </li>
            <li
              onClick={() => navigate('/admin/prison-rules')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaShieldAlt className="text-lg" /> Prison Rules
            </li>

            {/* User Management Section */}
            <li className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider border-b border-white/10 mt-4 mb-2">
              User Management
            </li>
            <li
              onClick={() => navigate('/admin/users')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaUsers className="text-lg" /> All Users
            </li>

            {/* System Section */}
            <li className="px-4 py-2 text-xs font-semibold text-white/60 uppercase tracking-wider border-b border-white/10 mt-4 mb-2">
              System
            </li>
            <li
              onClick={() => navigate('/admin/settings')}
              className="px-6 py-3 hover:bg-white/10 hover:pl-8 transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer"
            >
              <FaCog className="text-lg" /> Settings
            </li>
          </ul>
        </nav>

        <div className="p-6 border-t border-white/10 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-white/10 hover:bg-white/20 transition-colors duration-200 px-4 py-3 rounded-lg flex items-center gap-3 font-medium"
          >
            <FaSignOutAlt className="text-lg" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72 p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={toggleFullscreen}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                title="Toggle Fullscreen"
              >
                ⛶
              </button>
              <div className="relative">
                <FaBell className="text-xl text-gray-600 hover:text-indigo-600 cursor-pointer transition-colors" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPrisoners || stats.activeInmates}</h3>
                <p className="text-gray-600 font-medium">Active Prisoners</p>
                <span className="text-sm text-blue-600 font-medium">Current count</span>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUserShield className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBlocks}</h3>
                <p className="text-gray-600 font-medium">Prison Blocks</p>
                <span className="text-sm text-green-600 font-medium">Active blocks</span>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaBuilding className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalWardens}</h3>
                <p className="text-gray-600 font-medium">Wardens</p>
                <span className="text-sm text-purple-600 font-medium">Active wardens</span>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaUserTie className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalStaff}</h3>
                <p className="text-gray-600 font-medium">Total Staff</p>
                <span className="text-sm text-indigo-600 font-medium">All staff</span>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FaUsers className="text-2xl text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.recentIncidents}</h3>
                <p className="text-gray-600 font-medium">Recent Incidents</p>
                <span className="text-sm text-red-600 font-medium">This week</span>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <FaExclamationTriangle className="text-2xl text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingReports}</h3>
                <p className="text-gray-600 font-medium">Pending Reports</p>
                <span className="text-sm text-orange-600 font-medium">Need review</span>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FaFileAlt className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Prison Capacity Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.blockCapacity.totalCapacity}</div>
              <div className="text-gray-600">Total Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.blockCapacity.currentOccupancy}</div>
              <div className="text-gray-600">Current Occupancy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.blockCapacity.totalCapacity > 0
                  ? Math.round((stats.blockCapacity.currentOccupancy / stats.blockCapacity.totalCapacity) * 100)
                  : 0}%
              </div>
              <div className="text-gray-600">Occupancy Rate</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.blockCapacity.totalCapacity > 0
                    ? Math.min((stats.blockCapacity.currentOccupancy / stats.blockCapacity.totalCapacity) * 100, 100)
                    : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Recent Behavioral Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Recent Behavioral Reports</h3>
              <button
                onClick={() => navigate('/admin/behavioral-reports')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {behavioralReports.length > 0 ? behavioralReports.map((report, index) => (
                <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      report.reviewStatus === 'pending' ? 'bg-orange-500' :
                      report.reviewStatus === 'approved' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <h4 className="font-semibold text-gray-900">
                      {report.prisoner?.firstName} {report.prisoner?.lastName}
                    </h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{report.reportType}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 italic">No behavioral reports</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Incident Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Recent Incidents</h3>
              <button
                onClick={() => navigate('/admin/activity-reports')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {incidentReports.length > 0 ? incidentReports.map((incident, index) => (
                <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      incident.severity === 'high' ? 'bg-red-500' :
                      incident.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}></div>
                    <h4 className="font-semibold text-gray-900">{incident.incidentType}</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    Block: {incident.block?.name || 'N/A'}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(incident.incidentDate).toLocaleDateString()}
                  </p>
                </div>
              )) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 italic">No recent incidents</p>
                </div>
              )}
            </div>
          </div>

          {/* Prison Blocks Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Prison Blocks</h3>
              <button
                onClick={() => navigate('/admin/blocks')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Manage
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {prisonBlocks.length > 0 ? prisonBlocks.map((block, index) => (
                <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{block.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      block.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {block.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Capacity: {block.totalCapacity}</span>
                    <span>Occupied: {block.currentOccupancy}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${block.totalCapacity > 0
                          ? Math.min((block.currentOccupancy / block.totalCapacity) * 100, 100)
                          : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 italic">No prison blocks</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Prisoners */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Recent Prisoners</h3>
              <button
                onClick={() => navigate('/admin/prisoners')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {prisoners.length > 0 ? prisoners.map((prisoner, index) => (
                <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <FaUserShield className="text-gray-600 text-sm" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {prisoner.firstName} {prisoner.lastName}
                      </h4>
                      <p className="text-gray-500 text-xs">#{prisoner.prisonerNumber}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Block: {prisoner.currentBlock?.name || 'N/A'}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      prisoner.securityLevel === 'maximum' ? 'bg-red-100 text-red-800' :
                      prisoner.securityLevel === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {prisoner.securityLevel}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 italic">No prisoners found</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Pending Visit Requests</h3>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {pendingRequests.length}
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {pendingRequests.length > 0 ? pendingRequests.map((request, index) => (
                <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-b-0 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{request.visitorName}</h4>
                    <p className="text-gray-600">Wants to visit {request.inmateName}</p>
                    <span className="text-sm text-gray-500">{request.requestedDate}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      onClick={() => handleApproveRequest(request.id)}
                    >
                      <FaEye className="text-xs" /> Approve
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <FaTrash className="text-xs" /> Reject
                    </button>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 italic">No pending requests</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                View All
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-b-0 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaUserPlus className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.description}</p>
                    <span className="text-sm text-gray-500">{activity.timestamp}</span>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 italic">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
