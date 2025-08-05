import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaChartLine, 
  FaUsers, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaTrendingUp,
  FaTrendingDown,
  FaCalendarAlt,
  FaFilter,
  FaDownload,
  FaEye
} from 'react-icons/fa';

const BehaviorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedBlock, setSelectedBlock] = useState('all');

  // Mock analytics data
  const behaviorStats = {
    totalIncidents: 24,
    goodBehavior: 156,
    improvementRate: 12.5,
    criticalCases: 3,
    weeklyTrend: '+8%',
    monthlyTrend: '-15%'
  };

  const incidentsByType = [
    { type: 'Verbal Altercation', count: 8, percentage: 33.3, trend: 'up' },
    { type: 'Physical Fight', count: 6, percentage: 25.0, trend: 'down' },
    { type: 'Disobedience', count: 5, percentage: 20.8, trend: 'up' },
    { type: 'Property Damage', count: 3, percentage: 12.5, trend: 'stable' },
    { type: 'Other', count: 2, percentage: 8.3, trend: 'down' }
  ];

  const topInmates = [
    { id: 1, name: 'John Doe', inmateId: 'INM001', incidents: 5, lastIncident: '2024-01-20', status: 'Critical' },
    { id: 2, name: 'Mike Johnson', inmateId: 'INM003', incidents: 4, lastIncident: '2024-01-19', status: 'Warning' },
    { id: 3, name: 'Robert Smith', inmateId: 'INM005', incidents: 3, lastIncident: '2024-01-18', status: 'Monitoring' }
  ];

  const recentIncidents = [
    {
      id: 1,
      date: '2024-01-22',
      time: '14:30',
      type: 'Verbal Altercation',
      location: 'Block A - Recreation',
      inmates: ['John Doe', 'Mike Wilson'],
      severity: 'Medium',
      status: 'Resolved'
    },
    {
      id: 2,
      date: '2024-01-22',
      time: '11:15',
      type: 'Disobedience',
      location: 'Block B - Cell 205',
      inmates: ['Jane Smith'],
      severity: 'Low',
      status: 'Under Review'
    },
    {
      id: 3,
      date: '2024-01-21',
      time: '16:45',
      type: 'Physical Fight',
      location: 'Block A - Cafeteria',
      inmates: ['Robert Brown', 'David Lee'],
      severity: 'High',
      status: 'Resolved'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityBadge = (severity) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[severity]}`;
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800',
      'Warning': 'bg-yellow-100 text-yellow-800',
      'Monitoring': 'bg-blue-100 text-blue-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Under Review': 'bg-orange-100 text-orange-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FaTrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === 'down') return <FaTrendingDown className="h-4 w-4 text-green-500" />;
    return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
  };

  if (loading) {
    return (
      <WardenLayout title="Behavior Analytics" subtitle="Monitor and analyze inmate behavior patterns">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Behavior Analytics" subtitle="Monitor and analyze inmate behavior patterns">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Blocks</option>
              <option value="block-a">Block A</option>
              <option value="block-b">Block B</option>
              <option value="block-c">Block C</option>
              <option value="block-d">Block D</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <FaDownload className="mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{behaviorStats.totalIncidents}</p>
                <p className="text-sm text-red-600 mt-1">{behaviorStats.weeklyTrend} from last week</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Good Behavior</p>
                <p className="text-2xl font-bold text-gray-900">{behaviorStats.goodBehavior}</p>
                <p className="text-sm text-green-600 mt-1">+5% from last week</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Improvement Rate</p>
                <p className="text-2xl font-bold text-gray-900">{behaviorStats.improvementRate}%</p>
                <p className="text-sm text-blue-600 mt-1">+2.3% from last month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FaTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Cases</p>
                <p className="text-2xl font-bold text-gray-900">{behaviorStats.criticalCases}</p>
                <p className="text-sm text-orange-600 mt-1">Requires attention</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <FaUsers className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incident Types */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Incidents by Type</h3>
            <div className="space-y-4">
              {incidentsByType.map((incident, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(incident.trend)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{incident.type}</p>
                      <p className="text-xs text-gray-500">{incident.percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{incident.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Concerning Inmates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inmates Requiring Attention</h3>
            <div className="space-y-4">
              {topInmates.map((inmate) => (
                <div key={inmate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inmate.name}</p>
                    <p className="text-xs text-gray-500">ID: {inmate.inmateId}</p>
                    <p className="text-xs text-gray-500">Last incident: {inmate.lastIncident}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{inmate.incidents}</p>
                    <p className="text-xs text-gray-500">incidents</p>
                    <span className={getStatusBadge(inmate.status)}>
                      {inmate.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inmates Involved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
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
                {recentIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <div>
                          <div>{new Date(incident.date).toLocaleDateString()}</div>
                          <div className="text-gray-500">{incident.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{incident.type}</div>
                      <div className="text-sm text-gray-500">{incident.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {incident.inmates.join(', ')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {incident.inmates.length} inmate(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getSeverityBadge(incident.severity)}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(incident.status)}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <FaEye className="h-4 w-4" />
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

export default BehaviorAnalytics;
