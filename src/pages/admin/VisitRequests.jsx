import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { FaClipboardList } from 'react-icons/fa';

const VisitRequests = () => {
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // Default to pending tab

  useEffect(() => {
    fetchRequests();
    fetchHistory();
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

  const fetchHistory = async () => {
    try {
      const token = sessionStorage.getItem('token');
      // Try a dedicated history endpoint if available
      const res = await fetch('http://localhost:5000/api/visits/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.history)) {
          setHistory(data.history);
          return;
        }
      }
      // Fallback: compose from completed + rejected
      const base = 'http://localhost:5000';
      const [completedRes, rejectedRes] = await Promise.all([
        fetch(`${base}/api/visits/mine?status=completed`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${base}/api/visits/mine?status=rejected`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const [completed, rejected] = await Promise.all([
        completedRes.json().catch(() => ({})),
        rejectedRes.json().catch(() => ({}))
      ]);
      const normalize = (v, status) => ({
        _id: v._id,
        visitorName: v.visitor?.name || v.visitorName,
        prisonerName: v.prisoner ? `${v.prisoner.firstName} ${v.prisoner.lastName}` : v.inmateName,
        relationship: v.relationship || v.relation,
        purpose: v.purpose || v.description,
        visitDate: v.visitDate,
        visitTime: v.visitTime,
        status
      });
      const items = [
        ...((completed.visits || []).map(v => normalize(v, 'approved'))),
        ...((rejected.visits || []).map(v => normalize(v, 'rejected')))
      ];
      setHistory(items);
    } catch (e) {
      setHistory([]);
    }
  };

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  // Filter requests to show both pending and approved
  const filteredRequests = requests.filter(
    req => req.status === 'pending' || req.status === 'approved'
  );

  // Table component for pending requests
  const PendingRequestsTable = () => (
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
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800`}>pending</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const token = sessionStorage.getItem('token');
                      const res = await fetch(`http://localhost:5000/api/visits/${req._id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                      if (res.ok) {
                        fetchRequests();
                        fetchHistory();
                        showPopupMessage('Visit request APPROVED successfully!');
                      }
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={async () => {
                      const token = sessionStorage.getItem('token');
                      const res = await fetch(`http://localhost:5000/api/visits/${req._id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
                      if (res.ok) {
                        fetchRequests();
                        fetchHistory();
                        showPopupMessage('Visit request REJECTED successfully!');
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Table component for approved/rejected requests
  const ApprovedRequestsTable = () => (
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {history.map((req) => (
            <tr key={req._id}>
              <td className="px-6 py-4 whitespace-nowrap">{req.visitorName || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{req.prisonerName || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{req.relationship || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{req.purpose || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{req.visitDate ? new Date(req.visitDate).toISOString().slice(0,10) : '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">{req.visitTime || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{req.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <AdminLayout title="Visit Requests" subtitle="Manage visit requests and approvals">
      {/* Summary Card */}
      <div className="bg-white rounded-xl flex items-center gap-4 p-6 mb-6 w-full" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
        <div className="bg-blue-100 rounded-md p-3">
          <FaClipboardList className="text-2xl text-blue-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Total Pending Requests: {requests.length}</h4>
          <p className="text-sm text-gray-700">Active visit requests in the system</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Requests
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                {requests.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approved/Rejected Requests
              <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {history.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'pending' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Visit Requests</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : filteredRequests.filter(r => r.status === 'pending').length > 0 ? (
                <PendingRequestsTable />
              ) : (
                <div className="text-center py-8">
                  <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending visit requests</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approved/Rejected Requests</h3>
              {history.length > 0 ? (
                <ApprovedRequestsTable />
              ) : (
                <div className="text-center py-8">
                  <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No previous requests</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Popup Message */}
      {showPopup && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">{popupMessage}</span>
            <button
              onClick={() => setShowPopup(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default VisitRequests;
