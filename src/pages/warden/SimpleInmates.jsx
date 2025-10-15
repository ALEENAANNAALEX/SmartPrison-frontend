import React, { useState, useEffect } from 'react';

const SimpleInmates = () => {
  const [inmates, setInmates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    isolation: 0,
    medical: 0
  });

  useEffect(() => {
    fetchInmates();
  }, []);

  const fetchInmates = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/warden/inmates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.inmates)) {
          setInmates(data.inmates);
          setStats({
            total: data.inmates.length,
            active: data.inmates.filter(i => i.status === 'active').length,
            isolation: data.inmates.filter(i => i.status === 'isolation').length,
            medical: data.inmates.filter(i => i.status === 'medical').length
          });
        }
      }
    } catch (error) {
      console.error('Error fetching inmates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Inmates Management</h1>
          <p className="text-gray-600 mb-6">Manage and monitor all inmates</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900">Total Inmates</h3>
              <p className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900">Active</h3>
              <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats.active}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900">Isolation</h3>
              <p className="text-2xl font-bold text-red-600">{loading ? '...' : stats.isolation}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900">Medical</h3>
              <p className="text-2xl font-bold text-yellow-600">{loading ? '...' : stats.medical}</p>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Inmates</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading inmates...</p>
                </div>
              ) : inmates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No inmates found in the database.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inmates.slice(0, 5).map((inmate) => (
                    <div key={inmate._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {inmate.fullName || [inmate.firstName, inmate.middleName, inmate.lastName].filter(Boolean).join(' ') || 'Unknown'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ID: {inmate.prisonerNumber || 'N/A'} • {inmate.currentBlock?.name || 'Unknown Block'} • Cell {inmate.cellNumber || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        inmate.status === 'active' ? 'bg-green-100 text-green-800' : 
                        inmate.status === 'isolation' ? 'bg-red-100 text-red-800' :
                        inmate.status === 'medical' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inmate.status?.charAt(0).toUpperCase() + inmate.status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleInmates;
