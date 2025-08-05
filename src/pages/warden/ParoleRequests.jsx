import React, { useState, useEffect } from 'react';
import WardenLayout from '../../components/layout/WardenLayout';
import { 
  FaGavel, 
  FaSearch, 
  FaFilter, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaBalanceScale
} from 'react-icons/fa';

const ParoleRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEligibility, setFilterEligibility] = useState('all');

  // Mock data for parole requests
  const mockRequests = [
    {
      id: 1,
      inmateId: 'INM001',
      inmateName: 'John Doe',
      age: 28,
      crime: 'Theft',
      sentence: '5 years',
      servedTime: '3 years 2 months',
      remainingTime: '1 year 10 months',
      behavior: 'Good',
      eligibilityDate: '2024-01-15',
      applicationDate: '2024-01-20',
      hearingDate: '2024-02-15',
      status: 'Under Review',
      paroleOfficer: 'Officer Martinez',
      riskLevel: 'Low',
      rehabilitationPrograms: ['Anger Management', 'Job Training'],
      supportSystem: 'Family support available'
    },
    {
      id: 2,
      inmateId: 'INM003',
      inmateName: 'Mike Johnson',
      age: 35,
      crime: 'Assault',
      sentence: '7 years',
      servedTime: '4 years 6 months',
      remainingTime: '2 years 6 months',
      behavior: 'Average',
      eligibilityDate: '2024-03-10',
      applicationDate: '2024-01-22',
      hearingDate: '2024-03-01',
      status: 'Pending',
      paroleOfficer: 'Officer Davis',
      riskLevel: 'Medium',
      rehabilitationPrograms: ['Substance Abuse', 'Counseling'],
      supportSystem: 'Limited family support'
    },
    {
      id: 3,
      inmateId: 'INM005',
      inmateName: 'Robert Smith',
      age: 42,
      crime: 'Fraud',
      sentence: '4 years',
      servedTime: '3 years 8 months',
      remainingTime: '4 months',
      behavior: 'Excellent',
      eligibilityDate: '2023-12-01',
      applicationDate: '2024-01-10',
      hearingDate: '2024-01-25',
      status: 'Approved',
      paroleOfficer: 'Officer Wilson',
      riskLevel: 'Low',
      rehabilitationPrograms: ['Financial Literacy', 'Community Service'],
      supportSystem: 'Strong family and community support'
    },
    {
      id: 4,
      inmateId: 'INM007',
      inmateName: 'David Brown',
      age: 31,
      crime: 'Drug Possession',
      sentence: '3 years',
      servedTime: '2 years 1 month',
      remainingTime: '11 months',
      behavior: 'Good',
      eligibilityDate: '2024-02-01',
      applicationDate: '2024-01-18',
      hearingDate: '2024-02-20',
      status: 'Rejected',
      paroleOfficer: 'Officer Chen',
      riskLevel: 'Medium',
      rehabilitationPrograms: ['Drug Rehabilitation', 'Life Skills'],
      supportSystem: 'Halfway house arranged'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.inmateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.inmateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.crime.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status.toLowerCase().replace(' ', '') === filterStatus.toLowerCase();
    const matchesEligibility = filterEligibility === 'all' || 
                              (filterEligibility === 'eligible' && new Date(request.eligibilityDate) <= new Date()) ||
                              (filterEligibility === 'noteligible' && new Date(request.eligibilityDate) > new Date());
    
    return matchesSearch && matchesStatus && matchesEligibility;
  });

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Scheduled': 'bg-purple-100 text-purple-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getRiskBadge = (risk) => {
    const riskColors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${riskColors[risk] || 'bg-gray-100 text-gray-800'}`;
  };

  const getBehaviorBadge = (behavior) => {
    const behaviorColors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Average': 'bg-yellow-100 text-yellow-800',
      'Poor': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${behaviorColors[behavior] || 'bg-gray-100 text-gray-800'}`;
  };

  const isEligible = (eligibilityDate) => {
    return new Date(eligibilityDate) <= new Date();
  };

  const handleApprove = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'Approved' } : req
    ));
  };

  const handleReject = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'Rejected' } : req
    ));
  };

  if (loading) {
    return (
      <WardenLayout title="Parole Requests" subtitle="Review and manage inmate parole applications">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </WardenLayout>
    );
  }

  return (
    <WardenLayout title="Parole Requests" subtitle="Review and manage inmate parole applications">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search parole requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="underreview">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={filterEligibility}
              onChange={(e) => setFilterEligibility(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Eligibility</option>
              <option value="eligible">Eligible</option>
              <option value="noteligible">Not Eligible</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaGavel className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaHourglassHalf className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => r.status === 'Approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <FaBalanceScale className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Eligible</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter(r => isEligible(r.eligibilityDate)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parole Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Parole Requests ({filteredRequests.length})
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
                    Sentence & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Behavior & Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hearing Details
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
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.inmateName}</div>
                          <div className="text-sm text-gray-500">ID: {request.inmateId}</div>
                          <div className="text-sm text-gray-500">{request.age} years old</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.crime}</div>
                      <div className="text-sm text-gray-500">Sentence: {request.sentence}</div>
                      <div className="text-xs text-gray-500">Served: {request.servedTime}</div>
                      <div className="text-xs text-gray-500">Remaining: {request.remainingTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getBehaviorBadge(request.behavior)}>
                          {request.behavior}
                        </span>
                        <div>
                          <span className={getRiskBadge(request.riskLevel)}>
                            {request.riskLevel} Risk
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.rehabilitationPrograms.length} programs
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center mb-1">
                        <FaCalendarAlt className="mr-1 text-gray-400" />
                        {new Date(request.hearingDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{request.paroleOfficer}</div>
                      <div className="text-xs text-gray-500">
                        {isEligible(request.eligibilityDate) ? (
                          <span className="text-green-600">✓ Eligible</span>
                        ) : (
                          <span className="text-red-600">✗ Not Eligible</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <FaEye className="h-4 w-4" />
                        </button>
                        {(request.status === 'Pending' || request.status === 'Under Review') && (
                          <>
                            <button 
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <FaGavel className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No parole requests found</h3>
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

export default ParoleRequests;
