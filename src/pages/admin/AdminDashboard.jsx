import React, { useState, useEffect } from 'react'; // React core + hooks for state/effect
import AdminLayout from '../../components/AdminLayout'; // Common admin layout shell
import {
  FaUsers,
  FaUserShield,
  FaBuilding,
  FaUserTie,
  FaFileAlt,
  FaClipboardList,
  FaChartBar,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'; // Icons used in cards/quick actions/alerts

// Section: Component blueprint
// - State: stats, recentActivities, alerts, loading flag
// - Effects: initial dashboard fetch on mount
// - API: fetchDashboardData -> hits backend for aggregate stats and lists
// - Render: summary cards, charts, alerts, quick actions

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPrisoners: 0,
    totalWardens: 0,
    totalBlocks: 0,
    totalUsers: 0,
    recentIncidents: 0,
    pendingReports: 0,
    scheduledVisits: 0,
    capacity: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingVisits, setPendingVisits] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchPendingVisits();
  }, []);

  const fetchPendingVisits = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/visits/pending', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data?.pending) setPendingVisits(data.pending);
    } catch (e) {
      console.error('Error fetching pending visits:', e);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem('token');
      // Use precise endpoints that exist in backend/routes/admin.js
      const [statsRes, activityRes, alertsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/recent-activity', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/pending-requests', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const statsJson = statsRes.ok ? await statsRes.json() : null;
      const activityJson = activityRes.ok ? await activityRes.json() : [];
      const pendingJson = alertsRes.ok ? await alertsRes.json() : [];

      if (statsJson) {
        // Update only the fields provided by backend; keep demo values for the rest
        setStats(prev => ({
          ...prev,
          totalPrisoners: statsJson.activeInmates ?? prev.totalPrisoners,
          totalWardens: statsJson.totalStaff ?? prev.totalWardens,
          totalUsers: statsJson.totalUsers ?? prev.totalUsers,
          scheduledVisits: statsJson.totalVisits ?? prev.scheduledVisits
        }));
      }

      // Recent activities from endpoint returns simple array
      setRecentActivities(Array.isArray(activityJson) ? activityJson : []);

      // Use pending requests list as alert-like items
      const mappedAlerts = Array.isArray(pendingJson)
        ? pendingJson.map(pr => ({
            type: 'warning',
            title: 'Pending Visit Request',
            message: `${pr.visitorName} -> ${pr.inmateName}`,
            timestamp: pr.requestedDate || Date.now()
          }))
        : [];
      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Prisoners',
      value: stats.totalPrisoners,
      icon: FaUserShield,
      color: 'blue',
      change: '+5.2%',
      trend: 'up'
    },
    {
      title: 'Active Wardens',
      value: stats.totalWardens,
      icon: FaUserTie,
      color: 'purple',
      change: '+2.1%',
      trend: 'up'
    },
    {
      title: 'Prison Blocks',
      value: stats.totalBlocks,
      icon: FaBuilding,
      color: 'green',
      change: '0%',
      trend: 'neutral'
    },
    {
      title: 'System Users',
      value: stats.totalUsers,
      icon: FaUsers,
      color: 'orange',
      change: '+8.3%',
      trend: 'up'
    },
    {
      title: 'Recent Incidents',
      value: stats.recentIncidents,
      icon: FaExclamationTriangle,
      color: 'red',
      change: '-12.5%',
      trend: 'down'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: FaFileAlt,
      color: 'yellow',
      change: '+3.7%',
      trend: 'up'
    },
    {
      title: 'Scheduled Visits',
      value: stats.scheduledVisits,
      icon: FaCalendarCheck,
      color: 'indigo',
      change: '+15.2%',
      trend: 'up'
    },
    {
      title: 'Capacity Usage',
      value: `${Math.round((stats.totalPrisoners / Math.max(stats.capacity || 1, 1)) * 100)}%`,
      icon: FaChartBar,
      color: 'pink',
      change: '+2.8%',
      trend: 'up'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Overview of prison management system">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Overview of prison management system">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  <div className="flex items-center mt-2">
                    {card.trend === 'up' && <FaArrowUp className="text-green-500 text-sm mr-1" />}
                    {card.trend === 'down' && <FaArrowDown className="text-red-500 text-sm mr-1" />}
                    <span className={`text-sm font-medium ${
                      card.trend === 'up' ? 'text-green-600' : 
                      card.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                  <Icon className="text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            </div>
            <div className="p-6">
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending Visit Requests */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pending Visit Requests</h3>
              <button onClick={fetchPendingVisits} className="text-sm text-indigo-600 hover:underline">Refresh</button>
            </div>
            <div className="p-6">
              {pendingVisits.length > 0 ? (
                <div className="space-y-3">
                  {pendingVisits.map((req) => (
                    <div key={req._id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {req.visitor?.name} → {req.prisoner ? `${req.prisoner.firstName} ${req.prisoner.lastName}` : '-'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(req.visitDate).toISOString().slice(0,10)} at {req.visitTime}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            const token = sessionStorage.getItem('token');
                            const res = await fetch(`http://localhost:5000/api/visits/${req._id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                            if (res.ok) fetchPendingVisits();
                          }}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            const token = sessionStorage.getItem('token');
                            const res = await fetch(`http://localhost:5000/api/visits/${req._id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                            if (res.ok) fetchPendingVisits();
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaExclamationTriangle className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending visit requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              onClick={() => window.location.href = '/admin/prisoners'}
            >
              <FaUserShield className="text-2xl text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Prisoner</p>
            </button>
            <button
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              onClick={() => window.location.href = '/admin/wardens'}
            >
              <FaUserTie className="text-2xl text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Wardens</p>
            </button>
            <button
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              onClick={() => window.location.href = '/admin/blocks'}
            >
              <FaBuilding className="text-2xl text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Create Block</p>
            </button>
            <button
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
              onClick={() => window.location.href = '/admin/visit-requests'}
            >
              <FaClipboardList className="text-2xl text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Visits</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

// File purpose: Admin landing dashboard showing system stats, recent activities, and alerts with quick actions.
// Frontend location: Route /admin (Admin > Dashboard) via App.jsx routing.
// Backend endpoints used: GET http://localhost:5000/api/admin/dashboard for stats/activities/alerts.
// Auth: Requires Bearer token from sessionStorage.
// UI container: AdminLayout; Tailwind UI cards and iconography.
