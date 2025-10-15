import React, { useState, useEffect, useRef } from 'react';
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
  const [recentRecognitions, setRecentRecognitions] = useState([]); // [{inmateId,name,time,confidence}]
  const [highlightId, setHighlightId] = useState(null);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    present: 0,
    absent: 0,
    scanningProgress: 0
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanTimerRef = useRef(null);
  const faceApiLoadedRef = useRef(false);
  const faceMatcherRef = useRef(null);
  const knownInmatesRef = useRef([]);
  const markedSetRef = useRef(new Set());

  // No mock data; rely on API

  useEffect(() => {
    // Load today's attendance from API if available
    const fetchToday = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/staff/attendance/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.records)) {
            setTodayAttendance(data.records);
            // derive stats
            const presentCount = data.records.filter(r => r.status === 'Present').length;
            setStats(prev => ({ ...prev, totalAssigned: data.records.length, present: presentCount, absent: Math.max(0, data.records.length - presentCount) }));
            return;
          }
        }
      } catch (e) {}
      // If API fails, set empty state
      setTodayAttendance([]);
      setStats(prev => ({ ...prev, totalAssigned: 0, present: 0, absent: 0 }));
    };
    fetchToday();

    return () => {
      stopCamera();
    };
  }, []);

  // Load face-api.js and models lazily
  const ensureFaceApiLoaded = async () => {
    if (faceApiLoadedRef.current && window.faceapi) return;
    await new Promise((resolve, reject) => {
      if (window.faceapi) return resolve();
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/face-api.js@0.22.2/dist/face-api.min.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
    const modelsUrl = 'https://justadudewhohacks.github.io/face-api.js/models';
    await Promise.all([
      window.faceapi.nets.tinyFaceDetector.loadFromUri(modelsUrl),
      window.faceapi.nets.faceLandmark68Net.loadFromUri(modelsUrl),
      window.faceapi.nets.faceRecognitionNet.loadFromUri(modelsUrl)
    ]);
    faceApiLoadedRef.current = true;
  };

  // Build labeled face descriptors from inmate photos
  const buildLabeledDescriptors = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const r = await fetch('http://localhost:5000/api/staff/inmates', { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return [];
      const data = await r.json();
      const inmates = Array.isArray(data?.inmates) ? data.inmates : [];
      knownInmatesRef.current = inmates.map(i => ({ inmateId: i._id || i.id || i.inmateId, name: `${i.firstName || ''} ${i.lastName || ''}`.trim() }));
      const withPhotos = inmates.filter(i => i.photoUrl || i.photo || i.imageUrl);
      const descriptors = [];
      for (const person of withPhotos) {
        const url = person.photoUrl || person.photo || person.imageUrl;
        try {
          const img = await new Promise((resolve, reject) => {
            const im = new Image();
            im.crossOrigin = 'anonymous';
            im.src = url.startsWith('http') ? url : `${url}`;
            im.onload = () => resolve(im);
            im.onerror = reject;
          });
          const singleResult = await window.faceapi
            .detectSingleFace(img, new window.faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (singleResult?.descriptor) {
            descriptors.push(new window.faceapi.LabeledFaceDescriptors(
              person._id || person.id || person.inmateId || 'unknown',
              [singleResult.descriptor]
            ));
          }
        } catch (e) {
          // skip photo errors
        }
      }
      return descriptors;
    } catch (e) {
      return [];
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      alert('Unable to access camera. Please check permissions.');
      throw err;
    }
  };

  const waitForVideoReady = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState >= 2 && video.videoWidth > 0) return;
    await new Promise((resolve) => {
      const onReady = () => {
        if (video.videoWidth > 0) {
          video.removeEventListener('loadedmetadata', onReady);
          video.removeEventListener('canplay', onReady);
          resolve();
        }
      };
      video.addEventListener('loadedmetadata', onReady);
      video.addEventListener('canplay', onReady);
      // Fallback timeout
      setTimeout(onReady, 1000);
    });
  };

  const stopCamera = () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch {}
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.7);
  };

  const sendFrameToApi = async (imageDataUrl) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/staff/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: imageDataUrl })
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data; // expected: { detections: [{ inmateId, name, status, confidence, block, cell, time }] }
    } catch (e) {
      console.error('sendFrameToApi error', e);
      return null;
    }
  };

  const handleStartScanning = async () => {
    if (isScanning) return;
    await startCamera();
    await waitForVideoReady();
    try {
      await ensureFaceApiLoaded();
      if (!faceMatcherRef.current) {
        const labeled = await buildLabeledDescriptors();
        if (labeled.length > 0) {
          faceMatcherRef.current = new window.faceapi.FaceMatcher(labeled, 0.5);
        }
      }
    } catch (e) {}
    setIsScanning(true);
    let progress = 0;
    scanTimerRef.current = setInterval(async () => {
      if (!isScanning) return;
      const frame = captureFrame();
      if (!frame) {
        // Animate progress even if frame not ready yet
        progress = (progress + 5) % 100;
        setStats(prev => ({ ...prev, scanningProgress: progress }));
        return;
      }
      let handled = false;
      // Client-side recognition
      if (faceApiLoadedRef.current && faceMatcherRef.current && window.faceapi) {
        try {
          const img = await new Promise((resolve) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.src = frame;
          });
          const detections = await window.faceapi
            .detectAllFaces(img, new window.faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();
          // If no detections with Tiny model, try a second pass with a higher input size
          let results = detections;
          if (!results || results.length === 0) {
            const options = new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 });
            results = await window.faceapi.detectAllFaces(img, options).withFaceLandmarks().withFaceDescriptors();
          }
          const matches = (results || []).map(d => faceMatcherRef.current.findBestMatch(d.descriptor));
          const localDetections = matches
            .filter(m => m && m.label && m.label !== 'unknown' && m.distance <= 0.5)
            .map(m => {
              const inmateId = m.label;
              const meta = knownInmatesRef.current.find(x => String(x.inmateId) === String(inmateId));
              return { inmateId, name: meta?.name || 'Inmate', status: 'Present', confidence: Math.round((1 - m.distance) * 10000) / 100, time: new Date().toLocaleTimeString() };
            });
          if (localDetections.length > 0) {
            handled = true;
            await Promise.all(localDetections.map(d => markAttendanceOnce(d.inmateId)));
            integrateDetections(localDetections);
          }
        } catch (e) {}
      }
      // Fallback to server API
      if (!handled) {
        const result = await sendFrameToApi(frame);
        if (result && Array.isArray(result.detections)) {
          await Promise.all(result.detections.map(d => markAttendanceOnce(d.inmateId)));
          integrateDetections(result.detections);
        }
      }
      progress = (progress + 7) % 100;
      setStats(prev => ({ ...prev, scanningProgress: progress }));
    }, 1200);
  };

  const integrateDetections = (detections) => {
    if (!Array.isArray(detections)) return;
    // update recent chips and row highlight
    const now = new Date().toLocaleTimeString();
    const chips = detections.map(d => ({ inmateId: d.inmateId, name: d.name || 'Unknown', time: d.time || now, confidence: d.confidence }));
    setRecentRecognitions(prev => {
      const merged = [...chips, ...prev];
      return merged.slice(0, 6);
    });
    if (detections[0]?.inmateId) {
      setHighlightId(String(detections[0].inmateId));
      setTimeout(() => setHighlightId(null), 2000);
    }
    setTodayAttendance(prev => {
      const map = new Map(prev.map(r => [r.inmateId, { ...r }]));
      detections.forEach(d => {
        const current = map.get(d.inmateId) || {
          id: d.inmateId,
          inmateId: d.inmateId,
          name: d.name || 'Unknown',
          block: d.block || '-',
          cell: d.cell || '-',
          status: 'Present',
          scanTime: d.time || new Date().toLocaleTimeString(),
          confidence: d.confidence ? Math.round(d.confidence * 100) / 100 : null
        };
        current.status = d.status || 'Present';
        current.scanTime = d.time || new Date().toLocaleTimeString();
        current.confidence = d.confidence ? Math.round(d.confidence * 100) / 100 : current.confidence;
        map.set(d.inmateId, current);
      });
      const updated = Array.from(map.values());
      const presentCount = updated.filter(r => r.status === 'Present').length;
      setStats(prevStats => ({ ...prevStats, totalAssigned: updated.length || prevStats.totalAssigned, present: presentCount, absent: Math.max(0, (updated.length || prevStats.totalAssigned) - presentCount) }));
      return updated;
    });
  };

  const markAttendanceOnce = async (inmateId) => {
    if (!inmateId || markedSetRef.current.has(String(inmateId))) return;
    markedSetRef.current.add(String(inmateId));
    try {
      const token = sessionStorage.getItem('token');
      await fetch('http://localhost:5000/api/staff/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inmateId })
      });
    } catch (e) {}
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    setStats(prev => ({ ...prev, scanningProgress: 0 }));
    stopCamera();
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
                  {stats.totalAssigned > 0 ? Math.round((stats.present / stats.totalAssigned) * 100) : 0}%
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
            {/* Camera Feed */}
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="bg-gray-800 rounded-lg p-2 mb-4 flex items-center justify-center min-h-[320px]">
                <video ref={videoRef} className="max-h-[360px] w-full rounded" muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="text-white text-sm">
                {isScanning ? 'Scanning... Keep subjects in frame.' : 'Camera Ready'}
              </div>
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

            {/* Scan Instructions */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Scanning Instructions</h4>
              {/* Recent recognitions */}
              {recentRecognitions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {recentRecognitions.map((r, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                      ✓ {r.name} ({r.confidence ? `${r.confidence}%` : '--'})
                    </span>
                  ))}
                </div>
              )}
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
                  <tr key={record.id}
                      className={`hover:bg-gray-50 ${highlightId && String(record.inmateId) === String(highlightId) ? 'ring-2 ring-green-400' : ''}`}>
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
