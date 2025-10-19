import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RatingCard from '../components/RatingCard';
import axios from 'axios';

const RatingManagement = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [prisoners, setPrisoners] = useState([]);
  const [selectedPrisoner, setSelectedPrisoner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [summary, setSummary] = useState(null);
  const [topRated, setTopRated] = useState([]);
  const [newRating, setNewRating] = useState({
    prisonerId: '',
    cooperation: 3,
    discipline: 3,
    respect: 3,
    workEthic: 3,
    notes: '',
    period: 'monthly'
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchPrisoners();
    fetchRatings();
    fetchTopRated();
  }, []);

  useEffect(() => {
    if (selectedPrisoner) {
      fetchRatingSummary(selectedPrisoner);
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

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const params = selectedPrisoner ? `?prisonerId=${selectedPrisoner}` : '';
      const response = await axios.get(`${API_URL}/rating${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRatings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch ratings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingSummary = async (prisonerId) => {
    try {
      const response = await axios.get(`${API_URL}/rating/summary/${prisonerId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching rating summary:', err);
    }
  };

  const fetchTopRated = async () => {
    try {
      const response = await axios.get(`${API_URL}/rating/top-rated?limit=5`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTopRated(response.data);
    } catch (err) {
      console.error('Error fetching top rated:', err);
    }
  };

  const handleAddRating = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/rating`, newRating, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setShowAddForm(false);
      setNewRating({
        prisonerId: '',
        cooperation: 3,
        discipline: 3,
        respect: 3,
        workEthic: 3,
        notes: '',
        period: 'monthly'
      });
      fetchRatings();
      if (selectedPrisoner) {
        fetchRatingSummary(selectedPrisoner);
      }
      setError('');
    } catch (err) {
      setError('Failed to add rating');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRating({
      ...newRating,
      [name]: name.includes('cooperation') || name.includes('discipline') || 
              name.includes('respect') || name.includes('workEthic')
        ? parseInt(value)
        : value
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-100';
    if (rating >= 3.0) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 2.0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  const calculateOverallRating = () => {
    const { cooperation, discipline, respect, workEthic } = newRating;
    return ((cooperation + discipline + respect + workEthic) / 4).toFixed(2);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Rating Management System</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showAddForm ? 'Cancel' : '+ Add Rating'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Rating Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Rating</h2>
          <form onSubmit={handleAddRating} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prisoner</label>
                <select
                  name="prisonerId"
                  value={newRating.prisonerId}
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
                <label className="block text-sm font-medium mb-2">Period</label>
                <select
                  name="period"
                  value={newRating.period}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['cooperation', 'discipline', 'respect', 'workEthic'].map(category => (
                <div key={category}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()} (1-5)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      name={category}
                      min="1"
                      max="5"
                      value={newRating[category]}
                      onChange={handleInputChange}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-blue-600 w-8">{newRating[category]}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Overall Rating Preview</p>
              <p className="text-3xl font-bold text-blue-600">{calculateOverallRating()} / 5.0</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <textarea
                name="notes"
                value={newRating.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Additional comments about this rating period"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        </div>
      )}

      {/* Top Rated Prisoners */}
      {topRated.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">🏆 Top Rated Prisoners (Last 3 Months)</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topRated.map((prisoner, index) => (
              <div key={prisoner.prisonerId} className="bg-white rounded-lg p-4 text-center shadow">
                <div className="text-2xl mb-2">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}</div>
                <h3 className="font-semibold text-gray-800">{prisoner.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{prisoner.prisonerNumber}</p>
                <p className="text-2xl font-bold text-blue-600">{prisoner.averageRating}</p>
                <p className="text-xs text-gray-500">{prisoner.totalRatings} ratings</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prisoner Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filter by Prisoner:</label>
          <select
            value={selectedPrisoner || ''}
            onChange={(e) => setSelectedPrisoner(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Prisoners</option>
            {prisoners.map(prisoner => (
              <option key={prisoner._id} value={prisoner._id}>
                {prisoner.name} ({prisoner.prisonerNumber})
              </option>
            ))}
          </select>
          <button
            onClick={fetchRatings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Rating Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Average Rating</h3>
            <p className="text-3xl font-bold text-blue-600">{summary.averageRating}</p>
            <p className="text-xs text-gray-500 mt-1">{summary.totalRatings} total ratings</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Cooperation</h3>
            <p className="text-2xl font-bold text-blue-700">{summary.categoryAverages?.cooperation}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Discipline</h3>
            <p className="text-2xl font-bold text-green-700">{summary.categoryAverages?.discipline}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Respect</h3>
            <p className="text-2xl font-bold text-purple-700">{summary.categoryAverages?.respect}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-600 mb-2">Work Ethic</h3>
            <p className="text-2xl font-bold text-yellow-700">{summary.categoryAverages?.workEthic}</p>
          </div>
        </div>
      )}

      {summary && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Performance Trend</h3>
              <p className="text-sm text-gray-600">Comparing recent vs previous ratings</p>
            </div>
            <div className="text-center">
              <p className="text-4xl mb-2">{getTrendIcon(summary.trend)}</p>
              <p className={`text-lg font-semibold ${
                summary.trend === 'improving' ? 'text-green-600' : 
                summary.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {summary.trend.charAt(0).toUpperCase() + summary.trend.slice(1)}
              </p>
              {summary.trendPercentage !== 0 && (
                <p className="text-sm text-gray-600">{Math.abs(summary.trendPercentage)}% change</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ratings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
        ) : ratings.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No ratings found. Add a rating to get started.
          </div>
        ) : (
          ratings.map(rating => (
            <RatingCard key={rating._id} rating={rating} />
          ))
        )}
      </div>
    </div>
  );
};

export default RatingManagement;
