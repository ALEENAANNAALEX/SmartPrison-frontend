import React, { useState, useEffect } from 'react';
import StaffLayout from '../../components/layout/StaffLayout';
import { 
  FaCamera, 
  FaUsers, 
  FaCheckCircle, 
  FaTimesCircle,
  FaClock,
  FaPlay,
  FaStop,
  FaSync,
  FaDownload,
  FaCalendarAlt,
  FaIdCard
} from 'react-icons/fa';

const FaceRecognitionAttendance = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 24,
    present: 22,
    absent: 2,
    scanningProgress: 0
  });

  // Mock attendance data
  const mockTodayAttendance = [
    {
      id: 1,
      inmateId: 'INM001',
      name: 'John Doe',
      block: 'Block A',
      cell: 'A-101',
      status: 'Present',
      scanTime: '08:30:15',
      confidence: 98.5
    },
    {
      id: 2,
      inmateId: 'INM002',
      name: 'Jane Smith',
      block: 'Block B',
      cell: 'B-205',
      status: 'Present',
      scanTime: '08:31:22',
      confidence: 97.2
    },
    {
      id: 3,
      inmateId: 'INM003',
      name: 'Mike Johnson',
      block: 'Block A',
      cell: 'A-150',
      status: 'Absent',
      scanTime: null,
      confidence: null
    }
  ];

  useEffect(() => {
    setTodayAttendance(mockTodayAttendance);
  }, []);

  const handleStartScanning = () => {
    setIsScanning(true);
    // Simulate scanning progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setStats(prev => ({ ...prev, scanningProgress: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setStats(prev => ({ ...prev, scanningProgress: 0 }));
        // Simulate successful scan
        alert('Face recognition scan completed successfully!');
      }
    }, 500);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    setStats(prev => ({ ...prev, scanningProgress: 0 }));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'Late': 'bg-yellow-100 text-yellow-800'
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 95) return 'text-green-600';
    if (confidence >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <StaffLayout title="Face Recognition Attendance" subtitle="Mark inmate attendance using face recognition technology">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssigned}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaTimesCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaClock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((stats.present / stats.totalAssigned) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Face Recognition Scanner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Face Recognition Scanner</h3>
            <div className="flex space-x-2">
              <button
                onClick={handleStartScanning}
                disabled={isScanning}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaPlay className="mr-2" />
                Start Scan
              </button>
              <button
                onClick={handleStopScanning}
                disabled={!isScanning}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaStop className="mr-2" />
                Stop Scan
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <FaSync className="mr-2" />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Feed Simulation */}
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="bg-gray-800 rounded-lg p-8 mb-4">
                <FaCamera className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-white text-lg font-medium">
                  {isScanning ? 'Scanning in progress...' : 'Camera Ready'}
                </p>
                {isScanning && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${stats.scanningProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-green-400 text-sm mt-2">{stats.scanningProgress}% Complete</p>
                  </div>
                )}
              </div>
              <div className="text-gray-300 text-sm">
                Position inmates in front of the camera for face recognition
              </div>
            </div>

            {/* Scan Instructions */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Scanning Instructions</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Position Camera</p>
                    <p className="text-sm text-gray-600">Ensure camera has clear view of the area</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Start Scanning</p>
                    <p className="text-sm text-gray-600">Click "Start Scan" to begin face recognition</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Verify Results</p>
                    <p className="text-sm text-gray-600">Review attendance results and mark any corrections</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Today's Attendance ({new Date().toLocaleDateString()})
            </h3>
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <FaDownload className="mr-2" />
              Export
            </button>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scan Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaIdCard className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.name}</div>
                          <div className="text-sm text-gray-500">ID: {record.inmateId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{record.block}</div>
                      <div className="text-sm text-gray-500">Cell: {record.cell}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(record.status)}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.scanTime || 'Not scanned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.confidence ? (
                        <span className={`font-medium ${getConfidenceColor(record.confidence)}`}>
                          {record.confidence}%
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default FaceRecognitionAttendance;
