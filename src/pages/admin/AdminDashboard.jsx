import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
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
} from 'react-icons/fa';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setRecentActivities(data.recentActivities || []);
          setAlerts(data.alerts || []);
        }
      }
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
      value: `${Math.round((stats.totalPrisoners / stats.capacity) * 100)}%`,
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

        {/* Alerts & Notifications */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h3>
            </div>
            <div className="p-6">
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'critical' ? 'bg-red-50 border-red-400' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start">
                        <FaExclamationTriangle className={`text-sm mt-0.5 mr-2 ${
                          alert.type === 'critical' ? 'text-red-600' :
                          alert.type === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaExclamationTriangle className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active alerts</p>
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
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <FaUserShield className="text-2xl text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Prisoner</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <FaUserTie className="text-2xl text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Wardens</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <FaFileAlt className="text-2xl text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Create Report</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <FaCalendarCheck className="text-2xl text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Schedule Visit</p>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
