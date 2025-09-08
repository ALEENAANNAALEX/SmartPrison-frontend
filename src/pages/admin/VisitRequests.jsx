import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaClipboardList } from 'react-icons/fa';

const VisitRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/visits/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.pending)) {
        setRequests(data.pending);
      } else setRequests([]);
    } catch (e) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter requests to show both pending and approved
  const filteredRequests = requests.filter(
    req => req.status === 'pending' || req.status === 'approved'
  );

  return (
    <AdminLayout title="Pending Visit Requests" subtitle="Approve or reject visit requests">
      {/* Summary Card - styled like block card */}
      <div className="bg-white rounded-xl flex items-center gap-4 p-6 mb-6 w-full" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
        <div className="bg-blue-100 rounded-md p-3">
          <FaClipboardList className="text-2xl text-blue-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Total Pending Requests: {requests.length}</h4>
          <p className="text-sm text-gray-700">Active visit requests in the system</p>
        </div>
      </div>
      {/* Table: Pending Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredRequests.filter(r => r.status === 'pending').length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prisoner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.filter(r => r.status === 'pending').map((req) => (
                  <tr key={req._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{req.visitor?.name || req.visitorName || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{req.prisoner ? `${req.prisoner.firstName} ${req.prisoner.lastName}` : req.inmateName || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{req.relationship || req.relation || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{req.purpose || req.description || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{req.visitDate ? new Date(req.visitDate).toISOString().slice(0,10) : '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{req.visitTime || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{req.status || 'pending'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const token = sessionStorage.getItem('token');
                              const res = await fetch(`http://localhost:5000/api/visits/${req._id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                              if (res.ok) {
                                fetchRequests();
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              const token = sessionStorage.getItem('token');
                              const res = await fetch(`http://localhost:5000/api/visits/${req._id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                              if (res.ok) {
                                fetchRequests();
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pending visit requests</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default VisitRequests;
