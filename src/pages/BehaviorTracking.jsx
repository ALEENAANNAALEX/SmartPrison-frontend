import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BehaviorChart from '../components/BehaviorChart';
import axios from 'axios';

const BehaviorTracking = () => {
  const { user } = useAuth();
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [selectedPrisoner, setSelectedPrisoner] = useState(null);
  const [prisoners, setPrisoners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    behaviorType: '',
    severity: '',
    startDate: '',
    endDate: ''
  });
  const [newLog, setNewLog] = useState({
    prisonerId: '',
    behaviorType: 'neutral',
    severity: 'medium',
    description: '',
    location: '',
    witnesses: '',
    actionTaken: ''
  });
  const [summary, setSummary] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPrisoners();
    fetchBehaviorLogs();
  }, []);

  useEffect(() => {
    if (selectedPrisoner) {
      fetchBehaviorSummary(selectedPrisoner);
    }
  }, [selectedPrisoner]);

  const fetchPrisoners = async () => {
    try {
      const response = await axios.get(`${API_URL}/prisoners`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPrisoners(response.data);
    } catch (err) {
      console.error('Error fetching prisoners:', err);
    }
  };

  const fetchBehaviorLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.behaviorType) params.append('behaviorType', filters.behaviorType);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (selectedPrisoner) params.append('prisonerId', selectedPrisoner);

      const response = await axios.get(`${API_URL}/behavior/logs?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBehaviorLogs(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch behavior logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBehaviorSummary = async (prisonerId) => {
    try {
      const response = await axios.get(`${API_URL}/behavior/summary/${prisonerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching behavior summary:', err);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const logData = {
        ...newLog,
        witnesses: newLog.witnesses.split(',').map(w => w.trim()).filter(w => w)
      };

      await axios.post(`${API_URL}/behavior/logs`, logData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setShowAddForm(false);
      setNewLog({
        prisonerId: '',
        behaviorType: 'neutral',
        severity: 'medium',
        description: '',
        location: '',
        witnesses: '',
        actionTaken: ''
      });
      fetchBehaviorLogs();
      setError('');
    } catch (err) {
      setError('Failed to add behavior log');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleInputChange = (e) => {
    setNewLog({ ...newLog, [e.target.name]: e.target.value });
  };

  const getBehaviorColor = (type) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Behavior Tracking & Analytics</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showAddForm ? 'Cancel' : '+ Add Behavior Log'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Behavior Log Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Behavior Log</h2>
          <form onSubmit={handleAddLog} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prisoner</label>
              <select
                name="prisonerId"
                value={newLog.prisonerId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Prisoner</option>
                {prisoners.map(prisoner => (
                  <option key={prisoner._id} value={prisoner._id}>
                    {prisoner.name} ({prisoner.prisonerNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Behavior Type</label>
              <select
                name="behaviorType"
                value={newLog.behaviorType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                name="severity"
                value={newLog.severity}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={newLog.location}
                onChange={handleInputChange}
                required
                placeholder="e.g., Cell Block A, Cafeteria"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={newLog.description}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="Detailed description of the behavior incident"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Witnesses (comma separated)</label>
              <input
                type="text"
                name="witnesses"
                value={newLog.witnesses}
                onChange={handleInputChange}
                placeholder="Officer Smith, Officer Jones"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Action Taken</label>
              <input
                type="text"
                name="actionTaken"
                value={newLog.actionTaken}
                onChange={handleInputChange}
                placeholder="Warning issued, counseling scheduled"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Adding...' : 'Add Behavior Log'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            name="prisonerId"
            value={selectedPrisoner || ''}
            onChange={(e) => setSelectedPrisoner(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Prisoners</option>
            {prisoners.map(prisoner => (
              <option key={prisoner._id} value={prisoner._id}>
                {prisoner.name}
              </option>
            ))}
          </select>

          <select
            name="behaviorType"
            value={filters.behaviorType}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>

          <select
            name="severity"
            value={filters.severity}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={fetchBehaviorLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Behavior Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Behavior Score</h3>
            <p className="text-3xl font-bold text-blue-600">{summary.behaviorScore}/100</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Positive</h3>
            <p className="text-3xl font-bold text-green-600">{summary.positive}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Neutral</h3>
            <p className="text-3xl font-bold text-yellow-600">{summary.neutral}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Negative</h3>
            <p className="text-3xl font-bold text-red-600">{summary.negative}</p>
          </div>
        </div>
      )}

      {/* Behavior Chart */}
      {behaviorLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Behavior Trends</h2>
          <BehaviorChart data={behaviorLogs} />
        </div>
      )}

      {/* Behavior Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prisoner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : behaviorLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No behavior logs found
                  </td>
                </tr>
              ) : (
                behaviorLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.prisonerId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBehaviorColor(log.behaviorType)}`}>
                        {log.behaviorType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.location}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BehaviorTracking;
