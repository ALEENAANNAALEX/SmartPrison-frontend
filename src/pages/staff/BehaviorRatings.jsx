import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { 
  FaStar, 
  FaSearch, 
  FaFilter, 
  FaPlus,
  FaEye, 
  FaEdit,
  FaSave,
  FaTimes,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const BehaviorRatings = () => {
  const [inmates, setInmates] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedInmate, setSelectedInmate] = useState(null);
  const [notification, setNotification] = useState(null);

  // Rating form data
  const [ratingForm, setRatingForm] = useState({
    behavior: 5,
    cooperation: 5,
    workEthic: 5,
    socialInteraction: 5,
    ruleCompliance: 5,
    comments: '',
    weekStartDate: new Date().toISOString().split('T')[0]
  });

  // Mock data for assigned inmates
  const mockInmates = [
    {
      id: 1,
      inmateId: 'INM001',
      name: 'John Doe',
      block: 'Block A',
      cell: 'A-101',
      lastRating: '4.2/5',
      lastRatingDate: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      inmateId: 'INM002',
      name: 'Jane Smith',
      block: 'Block B',
      cell: 'B-205',
      lastRating: '4.8/5',
      lastRatingDate: '2024-01-14',
      status: 'Active'
    },
    {
      id: 3,
      inmateId: 'INM003',
      name: 'Mike Johnson',
      block: 'Block A',
      cell: 'A-150',
      lastRating: '3.1/5',
      lastRatingDate: '2024-01-10',
      status: 'Medical'
    }
  ];

  // Mock ratings data
  const mockRatings = [
    {
      id: 1,
      inmateId: 'INM001',
      inmateName: 'John Doe',
      weekStartDate: '2024-01-15',
      behavior: 4,
      cooperation: 4,
      workEthic: 5,
      socialInteraction: 4,
      ruleCompliance: 4,
      averageRating: 4.2,
      comments: 'Good improvement in work ethic this week.',
      submittedDate: '2024-01-21',
      status: 'Submitted'
    }
  ];

  useEffect(() => {
    setInmates(mockInmates);
    setRatings(mockRatings);
  }, []);

  const filteredInmates = inmates.filter(inmate => {
    const matchesSearch = inmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inmate.inmateId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = filterBlock === 'all' || inmate.block === filterBlock;
    
    return matchesSearch && matchesBlock;
  });

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate average rating
      const average = (
        ratingForm.behavior +
        ratingForm.cooperation +
        ratingForm.workEthic +
        ratingForm.socialInteraction +
        ratingForm.ruleCompliance
      ) / 5;

      const token = sessionStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/staff/behavior-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inmateId: selectedInmate.inmateId,
          inmateName: selectedInmate.name,
          weekStartDate: ratingForm.weekStartDate,
          behavior: ratingForm.behavior,
          cooperation: ratingForm.cooperation,
          workEthic: ratingForm.workEthic,
          socialInteraction: ratingForm.socialInteraction,
          ruleCompliance: ratingForm.ruleCompliance,
          averageRating: average,
          comments: ratingForm.comments,
          ratedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotification({
            type: 'success',
            message: `✅ Behavior rating submitted successfully for ${selectedInmate.name}! Rating ID: ${data.rating.ratingId}`
          });

          // Add to local state for immediate UI update
          const newRating = {
            id: ratings.length + 1,
            inmateId: selectedInmate.inmateId,
            inmateName: selectedInmate.name,
            weekStartDate: ratingForm.weekStartDate,
            behavior: ratingForm.behavior,
            cooperation: ratingForm.cooperation,
            workEthic: ratingForm.workEthic,
            socialInteraction: ratingForm.socialInteraction,
            ruleCompliance: ratingForm.ruleCompliance,
            averageRating: average,
            comments: ratingForm.comments,
            submittedDate: new Date().toISOString().split('T')[0],
            status: 'Submitted'
          };

          setRatings([...ratings, newRating]);

          // Reset form
          setRatingForm({
            behavior: 5,
            cooperation: 5,
            workEthic: 5,
            socialInteraction: 5,
            ruleCompliance: 5,
            comments: '',
            weekStartDate: new Date().toISOString().split('T')[0]
          });
          setShowRatingModal(false);
          setSelectedInmate(null);
        } else {
          setNotification({
            type: 'error',
            message: `❌ ${data.msg || 'Failed to submit behavior rating'}`
          });
        }
      } else {
        setNotification({
          type: 'error',
          message: '❌ Failed to submit behavior rating. Please try again.'
        });
      }

      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      console.error('Submit behavior rating error:', error);
      setNotification({
        type: 'error',
        message: '❌ Failed to submit rating. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (inmate) => {
    setSelectedInmate(inmate);
    setShowRatingModal(true);
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          >
            <FaStar />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({value}/5)</span>
      </div>
    </div>
  );

  return (
    <StaffLayout title="Behavior Ratings" subtitle="Submit weekly behavior ratings for assigned inmates">
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
                placeholder="Search inmates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Blocks</option>
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaStar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned Inmates</p>
                <p className="text-2xl font-bold text-gray-900">{inmates.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ratings Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{ratings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaExclamationTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending This Week</p>
                <p className="text-2xl font-bold text-gray-900">{inmates.length - ratings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaStar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inmates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Assigned Inmates ({filteredInmates.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inmate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Rating
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
                {filteredInmates.map((inmate) => (
                  <tr key={inmate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaIdCard className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{inmate.name}</div>
                          <div className="text-sm text-gray-500">ID: {inmate.inmateId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        <div>
                          <div>{inmate.block}</div>
                          <div className="text-gray-500">Cell: {inmate.cell}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaStar className="mr-1 text-yellow-400" />
                        <span className="font-medium text-gray-900">{inmate.lastRating}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(inmate.lastRatingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inmate.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {inmate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openRatingModal(inmate)}
                          className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <FaStar className="mr-1" />
                          Rate
                        </button>
                        <button 
                          onClick={() => alert(`Viewing details for ${inmate.name}`)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Ratings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Ratings</h3>
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{rating.inmateName}</h4>
                    <p className="text-sm text-gray-600">Week of {new Date(rating.weekStartDate).toLocaleDateString()}</p>
                    <div className="flex items-center mt-2">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="font-medium">{rating.averageRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {rating.status}
                  </span>
                </div>
                {rating.comments && (
                  <p className="text-sm text-gray-600 mt-2 italic">"{rating.comments}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedInmate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Submit Behavior Rating - {selectedInmate.name}
                </h3>
                <button 
                  onClick={() => setShowRatingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitRating} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Week Starting Date</label>
                <input
                  type="date"
                  value={ratingForm.weekStartDate}
                  onChange={(e) => setRatingForm({...ratingForm, weekStartDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StarRating
                  label="General Behavior"
                  value={ratingForm.behavior}
                  onChange={(value) => setRatingForm({...ratingForm, behavior: value})}
                />
                <StarRating
                  label="Cooperation"
                  value={ratingForm.cooperation}
                  onChange={(value) => setRatingForm({...ratingForm, cooperation: value})}
                />
                <StarRating
                  label="Work Ethic"
                  value={ratingForm.workEthic}
                  onChange={(value) => setRatingForm({...ratingForm, workEthic: value})}
                />
                <StarRating
                  label="Social Interaction"
                  value={ratingForm.socialInteraction}
                  onChange={(value) => setRatingForm({...ratingForm, socialInteraction: value})}
                />
              </div>

              <StarRating
                label="Rule Compliance"
                value={ratingForm.ruleCompliance}
                onChange={(value) => setRatingForm({...ratingForm, ruleCompliance: value})}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={ratingForm.comments}
                  onChange={(e) => setRatingForm({...ratingForm, comments: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional comments about the inmate's behavior this week..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
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
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default BehaviorRatings;
