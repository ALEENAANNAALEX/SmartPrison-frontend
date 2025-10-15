import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { 
  FaMapMarkerAlt, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaClock, 
  FaUsers, 
  FaCalendarAlt,
  FaTimes,
  FaSave,
  FaUserTie,
  FaHospital,
  FaHome,
  FaUtensils,
  FaUserFriends,
  FaDumbbell,
  FaBook,
  FaTools
} from 'react-icons/fa';

const ScheduleMapView = ({ schedules, onUpdateSchedule, onDeleteSchedule, onAddSchedule, preselect }) => {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddFormInPanel, setShowAddFormInPanel] = useState(false);
  const [viewMode, setViewMode] = useState('map');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [availableStaff, setAvailableStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showBlockStaffManagement, setShowBlockStaffManagement] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [facilityPositions, setFacilityPositions] = useState(() => {
    try {
      const raw = localStorage.getItem('facilityPositions');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [draggingFacility, setDraggingFacility] = useState(null);
  const mapRef = useRef(null);
  const { showSuccess, showError } = (() => {
    try {
      return useNotification();
    } catch {
      return { showSuccess: () => {}, showError: () => {} };
    }
  })();

  // Helpers: API base and token
  const getApiBase = () => (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
  const getToken = () => (sessionStorage.getItem('token') || localStorage.getItem('token'));

  // Fetch available staff for a time window (excludes those on overlapping schedules / leave per backend logic)
  const fetchAvailableStaff = async (date, startTime, endTime) => {
    try {
      const API_BASE = getApiBase();
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/warden/staff/available?date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.staff || []).map(s => s._id || s.id).filter(Boolean);
    } catch (e) {
      return [];
    }
  };


  // Preselect a schedule passed from parent (e.g., after creation)
  useEffect(() => {
    if (preselect) {
      setSelectedSchedule(preselect);
    }
  }, [preselect]);

  // Enhanced facility layout with central control area and side blocks
  const facilityLocations = {
    // Main Gate and Control Area (Top)
    'Main Gate': { x: 50, y: 5, color: 'bg-gray-800', icon: 'G', section: 'entrance' },
    'Control Room': { x: 50, y: 15, color: 'bg-gray-700', icon: 'C', section: 'control' },
    
    // Central Facilities (Middle)
    'Medical Room': { x: 30, y: 35, color: 'bg-red-500', icon: <FaHospital />, section: 'central' },
    'Kitchen': { x: 50, y: 35, color: 'bg-yellow-500', icon: <FaUtensils />, section: 'central' },
    'Visitor Area': { x: 70, y: 35, color: 'bg-purple-500', icon: <FaUserFriends />, section: 'central' },
    'Admin Office': { x: 50, y: 50, color: 'bg-gray-600', icon: 'A', section: 'central' },
    'Workshop': { x: 30, y: 65, color: 'bg-orange-600', icon: <FaTools />, section: 'central' },
    'Isolation': { x: 50, y: 65, color: 'bg-red-600', icon: 'I', section: 'central' },
    
    // Block A (Left Side)
    'Block A - Cells': { x: 15, y: 25, color: 'bg-blue-500', icon: 'A', section: 'block-a' },
    'Block A - Dining Room': { x: 15, y: 40, color: 'bg-yellow-400', icon: <FaUtensils />, section: 'block-a' },
    'Block A - Yard': { x: 15, y: 55, color: 'bg-green-600', icon: <FaDumbbell />, section: 'block-a' },
    
    // Block B (Right Side)
    'Block B - Cells': { x: 85, y: 25, color: 'bg-blue-500', icon: 'B', section: 'block-b' },
    'Block B - Dining Room': { x: 85, y: 40, color: 'bg-yellow-400', icon: <FaUtensils />, section: 'block-b' },
    'Block B - Yard': { x: 85, y: 55, color: 'bg-green-600', icon: <FaDumbbell />, section: 'block-b' }
  };

  const [newSchedule, setNewSchedule] = useState({
    title: '',
    type: 'Security',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '21:00',
    location: 'Control Room',
    assignedStaff: [],
    priority: 'Medium',
    description: '',
    timeLimit: '9-21' // 9-21 or 21-9
  });

  // Get staff by block and department (only free staff)
  const getStaffByBlockAndDepartment = () => {
    try {
      const blockStaff = {
        'Block A': {
          'Security': [],
          'Medical': [],
          'Administration': [],
          'Work': [],
          'Rehabilitation': []
        },
        'Block B': {
          'Security': [],
          'Medical': [],
          'Administration': [],
          'Work': [],
          'Rehabilitation': []
        },
        'Control Room': {
          'Security': [],
          'Medical': [],
          'Administration': [],
          'Work': [],
          'Rehabilitation': []
        },
        'Central Facilities': {
          'Security': [],
          'Medical': [],
          'Administration': [],
          'Work': [],
          'Rehabilitation': []
        }
      };

      if (!Array.isArray(availableStaff)) {
        console.warn('availableStaff is not an array:', availableStaff);
        return blockStaff;
      }

      // Get currently assigned staff IDs from schedules
      const assignedStaffIds = new Set();
      if (Array.isArray(schedules)) {
        schedules.forEach(schedule => {
          if (schedule.assignedStaff && Array.isArray(schedule.assignedStaff)) {
            schedule.assignedStaff.forEach(staff => {
              const staffId = getStaffId(staff);
              if (staffId) {
                assignedStaffIds.add(staffId);
              }
            });
          }
        });
      }

      availableStaff.forEach(staff => {
        try {
          const staffId = getStaffId(staff);
          
          // Skip if staff is already assigned to a schedule
          if (assignedStaffIds.has(staffId)) {
            return;
          }

          const dept = String(staff.department || 'Security');
          const assignedBlock = String(staff.assignedBlock || '');
          const position = String(staff.position || '');
          
          // Determine which block this staff belongs to
          let block = 'Central Facilities';
          if (assignedBlock.toLowerCase().includes('block a')) {
            block = 'Block A';
          } else if (assignedBlock.toLowerCase().includes('block b')) {
            block = 'Block B';
          } else if (position.toLowerCase().includes('prison control room officer')) {
            block = 'Control Room';
          }
          
          if (blockStaff[block] && blockStaff[block][dept]) {
            blockStaff[block][dept].push(staff);
          }
        } catch (error) {
          console.error('Error processing staff member:', staff, error);
        }
      });

      return blockStaff;
    } catch (error) {
      console.error('Error in getStaffByBlockAndDepartment:', error);
      return {
        'Block A': { 'Security': [], 'Medical': [], 'Administration': [], 'Work': [], 'Rehabilitation': [] },
        'Block B': { 'Security': [], 'Medical': [], 'Administration': [], 'Work': [], 'Rehabilitation': [] },
        'Control Room': { 'Security': [], 'Medical': [], 'Administration': [], 'Work': [], 'Rehabilitation': [] },
        'Central Facilities': { 'Security': [], 'Medical': [], 'Administration': [], 'Work': [], 'Rehabilitation': [] }
      };
    }
  };

  // Assign staff to a specific block
  const assignStaffToBlock = async (staffId, blockName, department) => {
    try {
      const API_BASE = getApiBase();
      const token = getToken();
      
      const response = await fetch(`${API_BASE}/api/warden/staff/${staffId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assignedBlock: blockName,
          department: department
        })
      });

      if (response.ok) {
        showSuccess(`Staff assigned to ${blockName} successfully`);
        loadAllStaff(); // Reload staff list
      } else {
        showError('Failed to assign staff to block');
      }
    } catch (error) {
      console.error('Error assigning staff to block:', error);
      showError('Failed to assign staff to block');
    }
  };

  // Load all staff from API
  const loadAllStaff = async () => {
    setStaffLoading(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
      const response = await fetch(`${API_BASE}/api/warden/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        // Try availability endpoint if present
        const alt = await fetch(`${API_BASE}/api/warden/staff/available`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!alt.ok) throw new Error('Failed to load staff');
        const altData = await alt.json();
        const altList = (altData.staff || altData.users || []).map(s => ({
          _id: s._id || s.id,
          name: s.name || s.email || 'Unknown',
          role: s.role,
          position: s.position || s?.roleSpecificDetails?.staffDetails?.position || '',
          department: s.department || s?.roleSpecificDetails?.staffDetails?.department || '',
          assignedBlock: s.assignedBlock || s?.roleSpecificDetails?.staffDetails?.assignedBlock || (Math.random() > 0.5 ? 'Block A' : 'Block B')
        }));
        setAvailableStaff(altList);
        return altList;
      }
      const data = await response.json();
      const list = (data.staff || data.users || []).map(s => ({
        _id: s._id || s.id,
        name: s.name || s.email || 'Unknown',
        role: s.role,
        position: s.position || s?.roleSpecificDetails?.staffDetails?.position || '',
        department: s.department || s?.roleSpecificDetails?.staffDetails?.department || '',
        assignedBlock: s.assignedBlock || s?.roleSpecificDetails?.staffDetails?.assignedBlock || null
      }));
      setAvailableStaff(list);
      return list;
    } catch (error) {
      console.error('Error loading staff:', error);
      setAvailableStaff([]);
      return [];
    } finally {
      setStaffLoading(false);
    }
  };

  // Filter staff by location
  const filterStaffByLocation = async (location) => {
    try {
      const all = await loadAllStaff();
      const date = newSchedule.date || new Date().toISOString().split('T')[0];
      const startTime = newSchedule.startTime || '09:00';
      const endTime = newSchedule.endTime || '21:00';
      const avail = await fetchAvailableStaff(date, startTime, endTime);
      
      const filtered = (all || availableStaff).filter(staff => {
        const idOk = avail.includes(getStaffId(staff));
        if (!idOk) return false;
        const pos = String(staff.position || '').toLowerCase();
        const dept = String(staff.department || '').toLowerCase();
        const assignedBlock = String(staff.assignedBlock || staff?.roleSpecificDetails?.staffDetails?.assignedBlock || '').toLowerCase();
        const isCRO = pos === 'prison control room officer';
        const isMedical = dept.includes('medical');
        const isAdmin = dept.includes('administration');
        const isSecurity = dept.includes('security');
        
        // Control Room: only Prison Control Room Officers
        if (location.toLowerCase() === 'control room') return isCRO;
        
        // Medical Room: only Medical staff
        if (location.toLowerCase().includes('medical room')) return isMedical;
        
        // Admin Office: only Administrative staff
        if (location.toLowerCase().includes('admin office')) return isAdmin;
        
        // Block A locations: only Block A staff
        if (location.toLowerCase().includes('block a')) {
          return isSecurity && !isCRO && assignedBlock.includes('block a');
        }
        
        // Block B locations: only Block B staff
        if (location.toLowerCase().includes('block b')) {
          return isSecurity && !isCRO && assignedBlock.includes('block b');
        }
        
        // Central Facilities: show all security staff (no block restriction)
        return isSecurity && !isCRO;
      });
      
      setAvailableStaff(filtered);
    } catch (error) {
      console.error('Error filtering staff by location:', error);
    }
  };

  // Load available staff from API (no mock fallback; show only real DB staff)
  useEffect(() => {
    loadAllStaff();
  }, []);

  // Filter staff when location changes in new schedule form
  useEffect(() => {
    if (showAddFormInPanel && newSchedule.location) {
      filterStaffByLocation(newSchedule.location);
    }
  }, [newSchedule.location, showAddFormInPanel]);

  // Filter staff when location changes in editing schedule form
  useEffect(() => {
    if (editingSchedule && editingSchedule.location) {
      filterStaffByLocation(editingSchedule.location);
    }
  }, [editingSchedule?.location]);

  // Disable noisy auto-enforce loop; enforcement happens on explicit actions
  useEffect(() => {
    return () => {};
  }, [schedules.length]);

  const toDateOnly = (d) => {
    if (!d) return '';
    try {
      if (typeof d === 'string') return d.split('T')[0];
      if (d instanceof Date) return d.toISOString().split('T')[0];
      // Object with $date or similar
      const s = String(d);
      return s.split('T')[0];
    } catch {
      return String(d).split('T')[0];
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesType = filterType === 'all' || schedule.type === filterType;
    const scheduleDateStr = toDateOnly(schedule.date);
    const matchesDate = !filterDate || scheduleDateStr === filterDate;
    return matchesType && matchesDate;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'border-blue-500 bg-blue-50',
      'In Progress': 'border-yellow-500 bg-yellow-50',
      'Completed': 'border-green-500 bg-green-50',
      'Cancelled': 'border-red-500 bg-red-50',
      'Postponed': 'border-gray-500 bg-gray-50'
    };
    return colors[status] || 'border-gray-500 bg-gray-50';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-500',
      'Medium': 'bg-yellow-500',
      'Low': 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  // Deterministic jitter so facilities are not perfectly in a line
  const computeJitter = (key, section) => {
    let hash = 2166136261;
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    // Normalize to 0..1
    const rnd1 = ((hash >>> 0) % 1000) / 1000;
    const rnd2 = (((hash >>> 12) % 1000)) / 1000;
    const maxX = (section === 'block-a' || section === 'block-b') ? 6 : 8; // percent
    const maxY = (section === 'block-a' || section === 'block-b') ? 10 : 8; // percent
    const dx = (rnd1 - 0.5) * 2 * maxX;
    const dy = (rnd2 - 0.5) * 2 * maxY;
    return { dx, dy };
  };

  const getFacilityXY = (name, config) => {
    const saved = facilityPositions[name];
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
      return { x: saved.x, y: saved.y };
    }
    const { dx, dy } = computeJitter(name, config.section);
    const x = Math.min(95, Math.max(5, config.x + dx));
    const y = Math.min(95, Math.max(5, config.y + dy));
    return { x, y };
  };

  const handleFacilityDragStart = (name) => {
    setDraggingFacility(name);
  };

  const handleMapDrop = (e) => {
    if (!draggingFacility || !mapRef.current) return;
    e.preventDefault();
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clamped = {
      x: Math.min(95, Math.max(5, x)),
      y: Math.min(95, Math.max(5, y))
    };
    setFacilityPositions(prev => {
      const next = { ...prev, [draggingFacility]: clamped };
      try { localStorage.setItem('facilityPositions', JSON.stringify(next)); } catch {}
      return next;
    });
    setDraggingFacility(null);
  };

  const handleMapDragOver = (e) => {
    if (draggingFacility) e.preventDefault();
  };

  // Helpers to deal with staff shapes (object with _id/id/name or raw id string)
  const getStaffId = (staff) => (typeof staff === 'object' ? (staff._id || staff.id) : staff);
  const getStaffName = (staff) => {
    if (typeof staff === 'object') return staff.name || staff.email || 'Unknown';
    const found = availableStaff.find(s => (s._id || s.id) === staff);
    return found ? (found.name || found.email || 'Unknown') : 'Unknown';
  };

  const getStaffPosition = (staff) => {
    if (typeof staff === 'object') return staff.position || '';
    const found = availableStaff.find(s => (s._id || s.id) === staff);
    return found ? (found.position || '') : '';
  };

  const normalizeBlockString = (value) => {
    const s = String(value || '').toLowerCase();
    return s.replace(/[^a-z]/g, ''); // remove spaces, hyphens, numbers
  };

  const staffBelongsToBlock = (staff, blockLetter) => {
    const raw = typeof staff === 'object' ? (staff.assignedBlock || '') : (() => {
      const found = availableStaff.find(s => (s._id || s.id) === staff);
      return found ? (found.assignedBlock || '') : '';
    })();
    const norm = normalizeBlockString(raw);
    if (blockLetter === 'A') return norm.includes('blocka') || norm === 'a';
    if (blockLetter === 'B') return norm.includes('blockb') || norm === 'b';
    return false;
  };

  // Aggregate assigned staff from currently visible schedules
  const getAssignedStaffSummary = () => {
    const map = new Map();
    for (const s of filteredSchedules) {
      for (const st of s.assignedStaff || []) {
        const id = getStaffId(st);
        const name = getStaffName(st);
        map.set(id, name);
      }
    }
    return Array.from(map, ([id, name]) => ({ id, name }));
  };

  const handleLocationClick = async (location) => {
    const schedulesAtLocation = filteredSchedules.filter(s => s.location === location);
    
    // Check if it's a block location
    const isBlockLocation = location.startsWith('Block A') || location.startsWith('Block B');
    
    if (schedulesAtLocation.length > 0) {
      setSelectedSchedule(schedulesAtLocation[0]);
    } else if (isBlockLocation) {
      // For block locations, check if the block has any staff assigned
      const blockName = location.startsWith('Block A') ? 'Block A' : 'Block B';
      const { blockStaffCount } = checkBlockCoverage();
      
      if (blockStaffCount[blockName] === 0) {
        // No staff assigned to this block, show add schedule form
        setNewSchedule(prev => ({ ...prev, location }));
        setShowAddFormInPanel(true);
        setSelectedSchedule(null);
        setEditingSchedule(null);
        
        // Load available staff for the default time slot
        const date = newSchedule.date || new Date().toISOString().split('T')[0];
        const startTime = newSchedule.startTime || '09:00';
        const endTime = newSchedule.endTime || '21:00';
        
        try {
          const all = await loadAllStaff();
          const avail = await fetchAvailableStaff(date, startTime, endTime);
          let availableStaffForAdd = (all || availableStaff).filter(staff => {
            const idOk = avail.includes(getStaffId(staff));
            const deptOk = String(staff.department || '').toLowerCase() === 'security';
            const pos = String(staff.position || '').toLowerCase();
            const assignedBlock = String(staff.assignedBlock || staff?.roleSpecificDetails?.staffDetails?.assignedBlock || '').toLowerCase();
            const isCRO = pos === 'prison control room officer';
            
            // For block locations, only assign security staff from the same block
            if (location.startsWith('Block A')) {
              return idOk && deptOk && !isCRO && assignedBlock.includes('block a');
            } else if (location.startsWith('Block B')) {
              return idOk && deptOk && !isCRO && assignedBlock.includes('block b');
            } else {
              // For central facilities, show all security staff
              return idOk && deptOk && !isCRO;
            }
          });
          // No fallback for block-specific locations - if no staff assigned to block, show empty list
          setAvailableStaff(availableStaffForAdd);
        } catch (error) {
          console.error('Error loading available staff for add form:', error);
        }
      } else {
        // Block has staff, show first schedule
        setSelectedSchedule(schedulesAtLocation[0]);
      }
    } else {
      // Non-block location (Control Room or Central), show add form
      setNewSchedule(prev => ({ ...prev, location }));
      setShowAddFormInPanel(true);
      setSelectedSchedule(null);
      setEditingSchedule(null);
      // Load and filter available staff: For Control Room show only CROs; otherwise show any available
      try {
        const all = await loadAllStaff();
        // Use current add-form time settings
        const date = newSchedule.date || new Date().toISOString().split('T')[0];
        const startTime = newSchedule.startTime || '09:00';
        const endTime = newSchedule.endTime || '21:00';
        const avail = await fetchAvailableStaff(date, startTime, endTime);
        const isControl = String(location).toLowerCase() === 'control room';
        const availableStaffForAdd = (all || availableStaff).filter(staff => {
          const idOk = avail.includes(getStaffId(staff));
          if (!idOk) return false;
          const pos = String(staff.position || '').toLowerCase();
          const dept = String(staff.department || '').toLowerCase();
          const assignedBlock = String(staff.assignedBlock || staff?.roleSpecificDetails?.staffDetails?.assignedBlock || '').toLowerCase();
          const isCRO = pos === 'prison control room officer';
          const isMedical = dept.includes('medical');
          const isAdmin = dept.includes('administration');
          const isSecurity = dept.includes('security');
          
          // Control Room: only Prison Control Room Officers
          if (isControl) return isCRO;
          
          // Medical Room: only Medical staff
          if (location.toLowerCase().includes('medical room')) return isMedical;
          
          // Admin Office: only Administrative staff
          if (location.toLowerCase().includes('admin office')) return isAdmin;
          
          // Block A locations: only Block A staff
          if (location.toLowerCase().includes('block a')) {
            return isSecurity && !isCRO && assignedBlock.includes('block a');
          }
          
          // Block B locations: only Block B staff
          if (location.toLowerCase().includes('block b')) {
            return isSecurity && !isCRO && assignedBlock.includes('block b');
          }
          
          // Central Facilities: show all security staff (no block restriction)
          return isSecurity && !isCRO;
        });
        setAvailableStaff(availableStaffForAdd);
      } catch (e) {
        console.error('Error loading available staff for add form (non-block):', e);
      }
    }
  };

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleEdit = async (schedule) => {
    setEditingSchedule({ ...schedule });
    setSelectedSchedule(null);
    
    // Load available staff for the specific time slot
    if (schedule.startTime && schedule.endTime && schedule.date) {
      try {
        const avail = await fetchAvailableStaff(toDateOnly(schedule.date), schedule.startTime, schedule.endTime);

        // Determine block context from location
        const isControl = String(schedule.location).toLowerCase().includes('control room');
        const isBlockA = String(schedule.location).startsWith('Block A');
        const isBlockB = String(schedule.location).startsWith('Block B');

        // Helper to decide if a staff belongs to required block
        const staffBelongsToRequiredBlock = (staff) => {
          if (isControl) return true; // both blocks can work in Control Center
          const name = (staff.name || '').toLowerCase();
          // Heuristic: If name contains 'block a' or 'block b' tags; fallback allow all
          if (isBlockA) return !name.includes('block b');
          if (isBlockB) return !name.includes('block a');
          return true;
        };

        const availableStaffForEdit = availableStaff
          // Only show those not scheduled in the time window OR already assigned to this schedule
          .filter(staff =>
            avail.includes(getStaffId(staff)) ||
            (schedule.assignedStaff || []).some(assigned => getStaffId(assigned) === getStaffId(staff))
          )
          // Position-based rules
          .filter(staff => {
            const pos = (staff.position || '').toLowerCase();
            const dept = (staff.department || '').toLowerCase();
            const isControlRoomOfficer = pos === 'prison control room officer';
            const isMedical = dept.includes('medical');
            const isAdmin = dept.includes('administration');
            const isSecurity = dept === 'security';
            
            // Control Room: only Prison Control Room Officers
            if (isControl) return isControlRoomOfficer;
            
            // Medical Room: only Medical staff
            if (schedule.location.toLowerCase().includes('medical room')) return isMedical;
            
            // Admin Office: only Administrative staff
            if (schedule.location.toLowerCase().includes('admin office')) return isAdmin;
            
            // Control Room Officer cannot be scheduled elsewhere
            if (isControlRoomOfficer) return false;
            
            // For block A/B editing, limit to Security staff of matching block
            const isBlockA = String(schedule.location).startsWith('Block A');
            const isBlockB = String(schedule.location).startsWith('Block B');
            if (isBlockA || isBlockB) {
              const belongsToBlock = isBlockA ? staffBelongsToBlock(staff, 'A') : staffBelongsToBlock(staff, 'B');
              return isSecurity && belongsToBlock && staffBelongsToRequiredBlock(staff);
            }
            
            // For other locations, allow any staff except CROs
            return !isControlRoomOfficer;
          });
        setAvailableStaff(availableStaffForEdit);
      } catch (error) {
        console.error('Error loading available staff for edit:', error);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editingSchedule) {
      // Prevent exceeding total available staff for the day
      try {
        const dateOnly = toDateOnly(editingSchedule.date);
        const currentSchedules = schedules.filter(s => toDateOnly(s.date) === dateOnly);
        const excludeId = editingSchedule._id || editingSchedule.id;
        // Check if we're trying to assign more staff than available
        const currentAssigned = new Set();
        currentSchedules.forEach(s => {
          if ((s._id || s.id) === excludeId) return;
          (s.assignedStaff || []).forEach(st => currentAssigned.add(getStaffId(st)));
        });
        
        // Count unique staff in the editing schedule
        const editingAssigned = new Set();
        (editingSchedule.assignedStaff || []).forEach(st => editingAssigned.add(getStaffId(st)));
        
        // Check if editing schedule has more staff than available
        const maxStaff = (availableStaff && availableStaff.length) ? availableStaff.length : 21;
        if (editingAssigned.size > maxStaff) {
          showError(`Cannot assign ${editingAssigned.size} staff to this schedule. You only have ${maxStaff} staff available.`);
          return;
        }
      } catch {}
      setLoading(true);
      try {
        const payload = {
          ...editingSchedule,
          assignedStaff: (editingSchedule.assignedStaff || []).map(getStaffId)
        };
        // Enforce staff assignment rules on save
        const location = String(payload.location).toLowerCase();
        const isControl = location === 'control room';
        const isMedical = location.includes('medical room');
        const isAdmin = location.includes('admin office');
        const isBlock = location.startsWith('block a') || location.startsWith('block b');
        
        const invalid = (payload.assignedStaff || []).some(id => {
          const pos = String(getStaffPosition(id)).toLowerCase();
          const dept = String(availableStaff.find(s => getStaffId(s) === id)?.department || '').toLowerCase();
          const isCRO = pos === 'prison control room officer';
          const isMedicalStaff = dept.includes('medical');
          const isAdminStaff = dept.includes('administration');
          const isSecurityStaff = dept === 'security';
          
          // Control Room: only Prison Control Room Officers
          if (isControl) return !isCRO;
          
          // Medical Room: only Medical staff
          if (isMedical) return !isMedicalStaff;
          
          // Admin Office: only Administrative staff
          if (isAdmin) return !isAdminStaff;
          
          // Control Room Officer cannot be scheduled elsewhere
          if (isCRO && !isControl) return true;
          
          // For blocks, prefer security staff
          if (isBlock && !isSecurityStaff) return false; // Allow non-security for blocks as fallback
          
          return false;
        });
        
        if (invalid) {
          let errorMsg = 'Invalid staff assignment: ';
          if (isControl) errorMsg += 'Only Prison Control Room Officer can work in Control Room.';
          else if (isMedical) errorMsg += 'Only Medical staff can work in Medical Room.';
          else if (isAdmin) errorMsg += 'Only Administrative staff can work in Admin Office.';
          else errorMsg += 'Prison Control Room Officer cannot be scheduled elsewhere.';
          showError(errorMsg);
          setLoading(false);
          return;
        }
        const success = await onUpdateSchedule(payload);
        if (success) {
          setEditingSchedule(null);
          showSuccess('Schedule updated successfully');
          // Reload all staff for future edits
          loadAllStaff();
          // Enforce control room exactly one CRO and ensure blocks covered
          await enforceControlRoomLimit();
          await ensureMinimumBlockCoverage(toDateOnly(editingSchedule.date));
        } else {
          showError('Failed to update schedule');
        }
      } catch (error) {
        console.error('Error updating schedule:', error);
        showError('Failed to update schedule');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    // Restore full staff list
    loadAllStaff();
  };

  const handleAddSchedule = async () => {
    if (newSchedule.title && newSchedule.location) {
      // Prevent exceeding total available staff for the day
      try {
        const dateOnly = new Date();
        dateOnly.setDate(dateOnly.getDate() + 1);
        const nextDay = dateOnly.toISOString().split('T')[0];
        const currentSchedules = schedules.filter(s => toDateOnly(s.date) === nextDay);
        // Check if we're trying to assign more staff than available
        const currentAssigned = new Set();
        currentSchedules.forEach(s => (s.assignedStaff || []).forEach(st => currentAssigned.add(getStaffId(st))));
        
        // Count unique staff in the new schedule
        const newAssigned = new Set();
        (newSchedule.assignedStaff || []).forEach(st => newAssigned.add(getStaffId(st)));
        
        // Check if new schedule has more staff than available
        const maxStaff = (availableStaff && availableStaff.length) ? availableStaff.length : 21;
        if (newAssigned.size > maxStaff) {
          showError(`Cannot assign ${newAssigned.size} staff to this schedule. You only have ${maxStaff} staff available.`);
          return;
        }
      } catch {}
      setLoading(true);
      try {
        // Create next day's schedule only when user clicks Save
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDayDate = tomorrow.toISOString().split('T')[0];
        const payload = {
          ...newSchedule,
          date: nextDayDate,
          assignedStaff: (newSchedule.assignedStaff || []).map(getStaffId)
        };
        // Enforce staff assignment rules on create
        const location = String(payload.location).toLowerCase();
        const isControl = location === 'control room';
        const isMedical = location.includes('medical room');
        const isAdmin = location.includes('admin office');
        const isBlock = location.startsWith('block a') || location.startsWith('block b');
        
        const invalid = (payload.assignedStaff || []).some(id => {
          const pos = String(getStaffPosition(id)).toLowerCase();
          const dept = String(availableStaff.find(s => getStaffId(s) === id)?.department || '').toLowerCase();
          const isCRO = pos === 'prison control room officer';
          const isMedicalStaff = dept.includes('medical');
          const isAdminStaff = dept.includes('administration');
          const isSecurityStaff = dept === 'security';
          
          // Control Room: only Prison Control Room Officers
          if (isControl) return !isCRO;
          
          // Medical Room: only Medical staff
          if (isMedical) return !isMedicalStaff;
          
          // Admin Office: only Administrative staff
          if (isAdmin) return !isAdminStaff;
          
          // Control Room Officer cannot be scheduled elsewhere
          if (isCRO && !isControl) return true;
          
          // For blocks, prefer security staff
          if (isBlock && !isSecurityStaff) return false; // Allow non-security for blocks as fallback
          
          return false;
        });
        
        if (invalid) {
          let errorMsg = 'Invalid staff assignment: ';
          if (isControl) errorMsg += 'Only Prison Control Room Officer can work in Control Room.';
          else if (isMedical) errorMsg += 'Only Medical staff can work in Medical Room.';
          else if (isAdmin) errorMsg += 'Only Administrative staff can work in Admin Office.';
          else errorMsg += 'Prison Control Room Officer cannot be scheduled elsewhere.';
          showError(errorMsg);
          setLoading(false);
          return;
        }
        const created = await onAddSchedule(payload);
        if (created) {
          showSuccess(`Schedule created successfully for ${nextDayDate}`);
          setShowAddFormInPanel(false);
          // Reset form after successful save
          setNewSchedule({
            title: '',
            type: 'Security',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '21:00',
            location: 'Control Room',
            assignedStaff: [],
            priority: 'Medium',
            description: '',
            timeLimit: '9-21'
          });
          loadAllStaff();
          // Enforce control room exactly one CRO and ensure blocks covered
          await enforceControlRoomLimit();
          await ensureMinimumBlockCoverage(nextDayDate);
        } else {
          showError('Failed to create schedule');
        }
      } catch (error) {
        console.error('Error adding schedule:', error);
        showError('Failed to create schedule');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenAddForm = async () => {
    setShowAddFormInPanel(true);
    setSelectedSchedule(null);
    setEditingSchedule(null);
    // Load available staff for the default time slot
    const date = newSchedule.date || new Date().toISOString().split('T')[0];
    const startTime = newSchedule.startTime || '09:00';
    const endTime = newSchedule.endTime || '21:00';
    
    try {
      // First load all staff
      const all = await loadAllStaff();
      // Then limit to those actually available in the selected window
      const avail = await fetchAvailableStaff(date, startTime, endTime);
      const isControl = String(newSchedule.location).toLowerCase() === 'control room';
      const filtered = (all || availableStaff).filter(staff => {
        const idOk = avail.includes(getStaffId(staff));
        if (!idOk) return false;
        const pos = String(staff.position || '').toLowerCase();
        const dept = String(staff.department || '').toLowerCase();
        const assignedBlock = String(staff.assignedBlock || staff?.roleSpecificDetails?.staffDetails?.assignedBlock || '').toLowerCase();
        const isCRO = pos === 'prison control room officer';
        const isMedical = dept.includes('medical');
        const isAdmin = dept.includes('administration');
        const isSecurity = dept.includes('security');
        
        // Control Room: only Prison Control Room Officers
        if (isControl) return isCRO;
        
        // Medical Room: only Medical staff
        if (newSchedule.location.toLowerCase().includes('medical room')) return isMedical;
        
        // Admin Office: only Administrative staff
        if (newSchedule.location.toLowerCase().includes('admin office')) return isAdmin;
        
        // Block A locations: only Block A staff
        if (newSchedule.location.toLowerCase().includes('block a')) {
          return isSecurity && !isCRO && assignedBlock.includes('block a');
        }
        
        // Block B locations: only Block B staff
        if (newSchedule.location.toLowerCase().includes('block b')) {
          return isSecurity && !isCRO && assignedBlock.includes('block b');
        }
        
        // Central Facilities: show all security staff (no block restriction)
        return isSecurity && !isCRO;
      });
      setAvailableStaff(filtered);
    } catch (error) {
      console.error('Error loading available staff for add form:', error);
    }
  };

  const handleCloseAddForm = () => {
    setShowAddFormInPanel(false);
    // Restore full staff list
    loadAllStaff();
  };

  // Enforce Control Room rule: exactly 1 staff and they MUST be a Prison Control Room Officer
  const enforceControlRoomLimit = async () => {
    const date = filterDate || new Date().toISOString().split('T')[0];
    const today = schedules.filter(s => toDateOnly(s.date) === date);
    const controlRoomSchedules = today.filter(s => s.location === 'Control Room' && s.type === 'Security');

    const allAssigned = [];
    controlRoomSchedules.forEach(s => (s.assignedStaff || []).forEach(st => allAssigned.push(getStaffId(st))));
    const totalAssigned = allAssigned.length;
    const allAreCRO = allAssigned.every(id => String(getStaffPosition(id)).toLowerCase() === 'prison control room officer');

    const ensureOneCRO = async () => {
      // Delete all existing control room schedules for that date
      for (const schedule of controlRoomSchedules) {
        await onDeleteSchedule(schedule._id || schedule.id);
      }
      // Find CROs available 09-21 and assign one
      const avail = await fetchAvailableStaff(date, '09:00', '21:00');
      const eligible = avail.filter(id => String(getStaffPosition(id)).toLowerCase() === 'prison control room officer');
      if (eligible.length > 0) {
        const payload = {
          title: 'Control Room Duty',
          type: 'Security',
          date,
          startTime: '09:00',
          endTime: '21:00',
          location: 'Control Room',
          assignedStaff: [eligible[0]],
          priority: 'High',
          description: ''
        };
        await onAddSchedule(payload);
        showSuccess('Control Room set to exactly one Prison Control Room Officer');
      } else {
        showError('No available Prison Control Room Officer for Control Room');
      }
    };

    try {
      if (totalAssigned === 1 && allAreCRO) {
        return; // OK
      }
      // If zero, create one CRO; if >1 or includes non-CRO, reset to one CRO
      await ensureOneCRO();
    } catch (e) {
      console.error('enforceControlRoomLimit error', e);
      showError('Failed to enforce Control Room rule');
    }
  };

  // Ensure each Block has at least one Security assignment for a date
  const ensureMinimumBlockCoverage = async (dateStr) => {
    try {
      const date = dateStr || (filterDate || new Date().toISOString().split('T')[0]);
      const todays = schedules.filter(s => toDateOnly(s.date) === date && s.type === 'Security');
      const counts = { 'Block A': 0, 'Block B': 0 };
      todays.forEach(s => {
        const count = (s.assignedStaff || []).length;
        if (s.location && s.location.startsWith('Block A')) counts['Block A'] += count;
        if (s.location && s.location.startsWith('Block B')) counts['Block B'] += count;
      });

      const missing = Object.entries(counts).filter(([_, c]) => c === 0).map(([b]) => b);
      if (missing.length === 0) return;

      for (const block of missing) {
        const defaultArea = block === 'Block A' ? 'Block A - Cells' : 'Block B - Cells';
        const slot = { start: '09:00', end: '21:00' };
        const avail = await fetchAvailableStaff(date, slot.start, slot.end);
        if (avail && avail.length > 0) {
          const payload = {
            title: `${block} Security Coverage`,
            type: 'Security',
            date,
            startTime: slot.start,
            endTime: slot.end,
            location: defaultArea,
            assignedStaff: [avail[0]],
            priority: 'High',
            description: ''
          };
          await onAddSchedule(payload);
          showSuccess(`${block}: minimum security coverage ensured`);
        } else {
          showError(`${block}: no available staff to ensure minimum coverage`);
        }
      }
    } catch (e) {
      console.error('ensureMinimumBlockCoverage error', e);
    }
  };

  // Force complete coverage for all block areas
  const handleForceCompleteCoverage = async () => {
    const date = filterDate || new Date().toISOString().split('T')[0];
    const blockAreas = [
      'Block A - Cells', 'Block A - Yard', 'Block A - Dining Room',
      'Block B - Cells', 'Block B - Yard', 'Block B - Dining Room'
    ];
    
    try {
      setLoading(true);
      const API_BASE = getApiBase();
      const token = getToken();
      
      // Get all available staff
      const res = await fetch(`${API_BASE}/api/warden/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = res.ok ? await res.json() : { staff: [] };
      const allStaff = (data.staff || data.users || []).map(s => ({
        id: s._id || s.id,
        name: s.name || s.email || 'Unknown'
      })).filter(s => !!s.id);
      
      let successCount = 0;
      const timeSlots = [
        { start: '09:00', end: '21:00' },
        { start: '21:00', end: '09:00' }
      ];
      
      // Assign staff to each block area
      for (const area of blockAreas) {
        let assigned = false;
        
        for (const slot of timeSlots) {
          const avail = await fetchAvailableStaff(date, slot.start, slot.end);
          const candidate = avail.find(id => allStaff.some(s => s.id === id));
          
          if (candidate) {
            const payload = {
              title: `${area} Security Coverage`,
              type: 'Security',
              date,
              startTime: slot.start,
              endTime: slot.end,
              location: area,
              assignedStaff: [candidate],
              priority: 'High',
              description: `Forced security coverage for ${area}`
            };
            const created = await onAddSchedule(payload);
            if (created) {
              successCount++;
              assigned = true;
              break;
            }
          }
        }
        
        if (!assigned) {
          // If still no assignment, try any available staff without time conflict check
          const randomStaff = allStaff[Math.floor(Math.random() * allStaff.length)];
          if (randomStaff) {
            const payload = {
              title: `${area} Security Coverage (Overlap)`,
              type: 'Security',
              date,
              startTime: '08:00',
              endTime: '23:59', // Fixed: Use valid end time
              location: area,
              assignedStaff: [randomStaff.id],
              priority: 'High',
              description: `Forced security coverage for ${area} (may overlap with other schedules)`
            };
            const created = await onAddSchedule(payload);
            if (created) {
              successCount++;
              assigned = true;
            }
          }
        }
      }
      
      if (successCount > 0) {
        showSuccess(`Force assigned ${successCount} security coverage assignments. All block areas should now have coverage.`);
      } else {
        showError('Could not assign any staff. Please check staff availability.');
      }
    } catch (error) {
      console.error('Force coverage error:', error);
      showError('Force coverage failed.');
    } finally {
      setLoading(false);
    }
  };

  // Check if all blocks have proper security coverage (1-2 staff per block)
  const checkBlockCoverage = () => {
    const date = filterDate || new Date().toISOString().split('T')[0];
    const todaySchedules = schedules.filter(s => s.date === date);
    
    // Count security staff per block
    const blockStaffCount = {
      'Block A': 0,
      'Block B': 0,
      'Control Room': 0
    };
    
    todaySchedules.forEach(schedule => {
      if (schedule.type === 'Security') {
        const staffCount = (schedule.assignedStaff || []).length;
        if (schedule.location.startsWith('Block A')) {
          blockStaffCount['Block A'] += staffCount;
        } else if (schedule.location.startsWith('Block B')) {
          blockStaffCount['Block B'] += staffCount;
        } else if (schedule.location === 'Control Room') {
          blockStaffCount['Control Room'] += staffCount;
        }
      }
    });
    
    // Check coverage status
    const blockCoverage = {
      'Block A': blockStaffCount['Block A'] >= 1 && blockStaffCount['Block A'] <= 2,
      'Block B': blockStaffCount['Block B'] >= 1 && blockStaffCount['Block B'] <= 2,
      'Control Room': blockStaffCount['Control Room'] >= 1 && blockStaffCount['Control Room'] <= 2
    };
    
    // Check if any block has too many staff
    const blockWarnings = {
      'Block A': blockStaffCount['Block A'] > 2 ? `Too many staff (${blockStaffCount['Block A']})` : null,
      'Block B': blockStaffCount['Block B'] > 2 ? `Too many staff (${blockStaffCount['Block B']})` : null,
      'Control Room': blockStaffCount['Control Room'] > 2 ? `Too many staff (${blockStaffCount['Control Room']})` : null
    };
    
    return { 
      blockCoverage, 
      blockStaffCount, 
      blockWarnings,
      totalStaff: Object.values(blockStaffCount).reduce((sum, count) => sum + count, 0)
    };
  };

  const getSchedulesAtLocation = (location) => {
    return filteredSchedules.filter(s => s.location === location);
  };

  const renderMapView = () => (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
      {/* Facility Map Background */}
      <div
        ref={mapRef}
        className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200"
        onDrop={handleMapDrop}
        onDragOver={handleMapDragOver}
      >
        
         {/* Section Dividers */}
         <div className="absolute left-1/4 top-0 w-0.5 h-full bg-gray-400 transform -translate-x-1/2"></div>
         <div className="absolute left-3/4 top-0 w-0.5 h-full bg-gray-400 transform -translate-x-1/2"></div>
         <div className="absolute left-0 top-1/3 w-full h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
         <div className="absolute left-0 top-2/3 w-full h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
         
         {/* Section Labels */}
         <div className="absolute top-2 left-4 text-sm font-bold text-gray-600">BLOCK A</div>
         <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-600">CONTROL CENTER</div>
         <div className="absolute top-2 right-4 text-sm font-bold text-gray-600">BLOCK B</div>
         <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">CENTRAL FACILITIES</div>
        
        {/* Facility Buildings */}
        {Object.entries(facilityLocations).map(([location, config]) => {
          const schedulesAtLocation = getSchedulesAtLocation(location);
          const hasSchedules = schedulesAtLocation.length > 0;
          // Unique on-duty staff count at this location
          const uniqueStaff = new Set();
          for (const s of schedulesAtLocation) {
            (s.assignedStaff || []).forEach(st => uniqueStaff.add(getStaffId(st)));
          }
          const staffCount = uniqueStaff.size;
          const pos = getFacilityXY(location, config);
          const leftPct = pos.x;
          const topPct = pos.y;
          
          // Check if this is a block location and if it needs staff
          const isBlockLocation = location.startsWith('Block A') || location.startsWith('Block B');
          const blockName = isBlockLocation ? (location.startsWith('Block A') ? 'Block A' : 'Block B') : null;
          const { blockStaffCount } = checkBlockCoverage();
          
          // Get block staff information
      const blockStaff = getStaffByBlockAndDepartment();
      const blockStaffInfo = blockStaff[blockName] || {};
      const totalFreeBlockStaff = Object.values(blockStaffInfo).flat().length;
          
          // For block locations, check if the specific location has staff, not the entire block
          const needsStaff = isBlockLocation && staffCount === 0;
          
          return (
            <div
              key={location}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                hasSchedules ? 'scale-110' : 'scale-100'
              } ${needsStaff ? 'animate-pulse' : ''}`}
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              onClick={() => handleLocationClick(location)}
              draggable
              onDragStart={() => handleFacilityDragStart(location)}
            >
              {/* Building */}
              <div className={`w-16 h-16 rounded-lg ${config.color} shadow-lg flex items-center justify-center text-white text-2xl font-bold relative group ${
                needsStaff ? 'ring-2 ring-red-400 ring-opacity-75' : ''
              }`}>
                {typeof config.icon === 'string' ? config.icon : config.icon}
                
                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {location} {needsStaff ? '(Click to add cell)' : ''}
                </div>
              </div>
              
              {/* Staff Count Badge or Needs Staff Indicator */}
              {hasSchedules && staffCount > 0 ? (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold" title={`${staffCount} staff on duty`}>
                  {staffCount}
                </div>
              ) : needsStaff ? (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold" title="No cell assigned - Click to add">
                  !
                </div>
              ) : null}
              
              {/* Location Label */}
              <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap max-w-24 text-center ${
                needsStaff ? 'text-red-600 font-bold' : ''
              }`}>
                {location} {needsStaff ? '(No Staff)' : ''}
            {isBlockLocation && totalFreeBlockStaff > 0 && (
              <div className="text-xs text-green-600 font-bold">
                {totalFreeBlockStaff} free staff
              </div>
            )}
              </div>
            </div>
          );
        })}
        
        {/* Schedule Markers */}
        {filteredSchedules.map((schedule, index) => {
          const loc = facilityLocations[schedule.location];
          if (!loc) return null;
          const perLocIndexKey = `__idx_${schedule.location}`;
          if (!window[perLocIndexKey]) window[perLocIndexKey] = 0;
          const idx = window[perLocIndexKey]++;
          const ring = Math.floor(idx / 8);
          const angle = (idx % 8) * (Math.PI / 4);
          const radius = 6 + ring * 4;
          const left = loc.x + radius * Math.cos(angle);
          const top = loc.y + radius * Math.sin(angle);
          return (
            <div
              key={`${schedule._id || schedule.id || 'item'}-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-110"
              style={{ left: `${left}%`, top: `${top}%` }}
              onClick={() => handleScheduleClick(schedule)}
              title={`${schedule.title} - ${schedule.startTime} to ${schedule.endTime}`}
            >
              <div className={`w-5 h-5 rounded-full ${getPriorityColor(schedule.priority)} border-2 border-white shadow-lg`}></div>
            </div>
          );
        })}
      </div>
      
      {/* Map Legend */}
      {/* Legend removed for full-screen view */}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredSchedules.map((schedule) => (
        <div
          key={schedule.id}
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(schedule.status)}`}
          onClick={() => handleScheduleClick(schedule)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(schedule.priority)}`}></div>
                <h4 className="font-semibold text-gray-900">
                  {schedule.assignedStaff && schedule.assignedStaff.length > 0 
                    ? `${schedule.assignedStaff.map(staff => staff.name || staff).join(', ')} - ${schedule.location} (${new Date(schedule.date).toLocaleDateString()})`
                    : schedule.title
                  }
                </h4>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {schedule.type}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {schedule.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaClock className="mr-2" />
                  {schedule.startTime} - {schedule.endTime}
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  {schedule.location}
                </div>
                <div className="flex items-center col-span-2">
                  <FaUsers className="mr-2" />
                  {schedule.assignedStaff?.map(staff => staff.name || staff).join(', ') || 'No staff assigned'}
                </div>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(schedule);
                }}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <FaEdit className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSchedule(schedule._id || schedule.id);
                }}
                className="text-red-600 hover:text-red-900"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaMapMarkerAlt className="inline mr-1" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaCalendarAlt className="inline mr-1" />
              List View
            </button>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Security">Security</option>
            <option value="Medical">Medical</option>
            <option value="Rehabilitation">Rehabilitation</option>
            <option value="Work">Work</option>
            <option value="Visitation">Visitation</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Education">Education</option>
            <option value="Recreation">Recreation</option>
          </select>
          
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        

        {/* Force Complete Coverage button removed per requirement */}

        {/* Block Staff Status */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">Free Staff by Block:</span>
          {(() => {
            try {
              const blockStaff = getStaffByBlockAndDepartment();
              return Object.entries(blockStaff).map(([blockName, departments]) => {
                const totalFreeStaff = Object.values(departments).flat().length;
                const securityStaff = departments.Security?.length || 0;
                const hasSecurity = securityStaff > 0;
                
                return (
                  <span
                    key={blockName}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hasSecurity 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}
                    title={`${blockName}: ${totalFreeStaff} free staff (${securityStaff} security)`}
                  >
                    {blockName} {totalFreeStaff} {hasSecurity ? '✓' : '⚠'}
                  </span>
                );
              });
            } catch (error) {
              console.error('Error rendering block staff status:', error);
              return <span className="text-red-500 text-xs">Error loading staff status</span>;
            }
          })()}
          
          {/* Total Staff Count */}
          <div className="ml-4 text-xs text-gray-500">
            Total Free Staff: {(() => {
              if (!Array.isArray(availableStaff) || !Array.isArray(schedules)) {
                return 0;
              }
              
              const assignedStaffIds = new Set();
              schedules.forEach(schedule => {
                if (schedule.assignedStaff && Array.isArray(schedule.assignedStaff)) {
                  schedule.assignedStaff.forEach(staff => {
                    const staffId = getStaffId(staff);
                    if (staffId) {
                      assignedStaffIds.add(staffId);
                    }
                  });
                }
              });
              
              const freeStaffCount = availableStaff.filter(staff => {
                const staffId = getStaffId(staff);
                return !assignedStaffIds.has(staffId);
              }).length;
              
              return freeStaffCount;
            })()}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleOpenAddForm}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Add Schedule
          </button>
          
          <button
            onClick={() => setShowBlockStaffManagement(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Manage staff by blocks"
          >
            <FaUsers className="mr-2" />
            Block Staff
          </button>
          
          <button
            onClick={enforceControlRoomLimit}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            title="Enforce Control Room limit (max 2 staff)"
          >
            <FaTools className="mr-2" />
            Fix Control Room
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map/List View */}
        <div className="lg:col-span-2">
          {viewMode === 'map' ? renderMapView() : renderListView()}
        </div>

        {/* Schedule Details/Edit Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {showAddFormInPanel ? 'Add New Schedule' : editingSchedule ? 'Edit Schedule' : selectedSchedule ? 'Schedule Details' : 'No Selection'}
            </h3>
          </div>
          
          <div className="p-6">
            {showAddFormInPanel ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter schedule title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newSchedule.type}
                      onChange={(e) => setNewSchedule({...newSchedule, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Security">Security</option>
                      <option value="Medical">Medical</option>
                      <option value="Rehabilitation">Rehabilitation</option>
                      <option value="Work">Work</option>
                      <option value="Visitation">Visitation</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Education">Education</option>
                      <option value="Recreation">Recreation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newSchedule.priority}
                      onChange={(e) => setNewSchedule({...newSchedule, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={newSchedule.location}
                    onChange={(e) => {
                      setNewSchedule({...newSchedule, location: e.target.value});
                      // Staff filtering will be handled by useEffect
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {Object.keys(facilityLocations).map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit</label>
                  <select
                    value={newSchedule.timeLimit}
                    onChange={(e) => {
                      const timeLimit = e.target.value;
                      setNewSchedule({
                        ...newSchedule, 
                        timeLimit,
                        startTime: timeLimit === '9-21' ? '09:00' : '21:00',
                        endTime: timeLimit === '9-21' ? '21:00' : '09:00'
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="9-21">9 AM - 9 PM</option>
                    <option value="21-9">9 PM - 9 AM</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newSchedule.startTime}
                      onChange={async (e) => {
                        setNewSchedule({...newSchedule, startTime: e.target.value});
                        // Reload available staff for new time
                        if (e.target.value && newSchedule.endTime) {
                          try {
                            const avail = await fetchAvailableStaff(newSchedule.date, e.target.value, newSchedule.endTime);
                            // Get all staff first
                            const API_BASE = getApiBase();
                            const token = getToken();
                            const res = await fetch(`${API_BASE}/api/warden/staff`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const data = res.ok ? await res.json() : { staff: [] };
                            const allStaff = (data.staff || data.users || []).map(s => ({
                              _id: s._id || s.id,
                              name: s.name || s.email || 'Unknown',
                              role: s.role
                            }));
                            const availableStaffForAdd = allStaff.filter(staff => 
                              avail.includes(getStaffId(staff))
                            );
                            setAvailableStaff(availableStaffForAdd);
                          } catch (error) {
                            console.error('Error loading available staff:', error);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={newSchedule.endTime}
                      onChange={async (e) => {
                        setNewSchedule({...newSchedule, endTime: e.target.value});
                        // Reload available staff for new time
                        if (newSchedule.startTime && e.target.value) {
                          try {
                            const avail = await fetchAvailableStaff(newSchedule.date, newSchedule.startTime, e.target.value);
                            // Get all staff first
                            const API_BASE = getApiBase();
                            const token = getToken();
                            const res = await fetch(`${API_BASE}/api/warden/staff`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const data = res.ok ? await res.json() : { staff: [] };
                            const allStaff = (data.staff || data.users || []).map(s => ({
                              _id: s._id || s.id,
                              name: s.name || s.email || 'Unknown',
                              role: s.role
                            }));
                            const availableStaffForAdd = allStaff.filter(staff => 
                              avail.includes(getStaffId(staff))
                            );
                            setAvailableStaff(availableStaffForAdd);
                          } catch (error) {
                            console.error('Error loading available staff:', error);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Staff Allocation for New Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Staff ({availableStaff.length} available)
                  </label>
                  {/* Selected staff chips */}
                  {Array.isArray(newSchedule.assignedStaff) && newSchedule.assignedStaff.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newSchedule.assignedStaff.map((sid) => {
                        const name = getStaffName(sid);
                        return (
                          <span key={sid} className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {name}
                            <button
                              onClick={() => setNewSchedule({
                                ...newSchedule,
                                assignedStaff: newSchedule.assignedStaff.filter(x => getStaffId(x) !== sid)
                              })}
                              className="ml-1 text-indigo-500 hover:text-indigo-700"
                              title="Remove"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {staffLoading ? (
                      <div className="text-sm text-gray-500 text-center py-4">Loading staff...</div>
                    ) : availableStaff.length > 0 ? (
                      availableStaff
                        .filter(st => !(newSchedule.assignedStaff || []).some(sel => getStaffId(sel) === getStaffId(st)))
                        .map((staff) => {
                        const staffId = getStaffId(staff);
                        const staffName = getStaffName(staff);
                        return (
                          <label key={staffId} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewSchedule({
                                    ...newSchedule,
                                    assignedStaff: [...newSchedule.assignedStaff, staffId]
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{staffName}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-4">No staff found.</div>
                    )}
                  </div>
                </div>
                
                {/* Description removed per requirement */}
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddSchedule}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCloseAddForm}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : editingSchedule ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingSchedule.title}
                    onChange={(e) => setEditingSchedule({...editingSchedule, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={editingSchedule.type}
                      onChange={(e) => setEditingSchedule({...editingSchedule, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Security">Security</option>
                      <option value="Medical">Medical</option>
                      <option value="Rehabilitation">Rehabilitation</option>
                      <option value="Work">Work</option>
                      <option value="Visitation">Visitation</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Education">Education</option>
                      <option value="Recreation">Recreation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={editingSchedule.priority}
                      onChange={(e) => setEditingSchedule({...editingSchedule, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={editingSchedule.location}
                    onChange={(e) => {
                      setEditingSchedule({...editingSchedule, location: e.target.value});
                      // Staff filtering will be handled by useEffect
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {Object.keys(facilityLocations).map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={editingSchedule.startTime}
                      onChange={(e) => setEditingSchedule({...editingSchedule, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={editingSchedule.endTime}
                      onChange={(e) => setEditingSchedule({...editingSchedule, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Staff Allocation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Staff ({availableStaff.length} available)
                  </label>
                  {/* Selected staff chips */}
                  {Array.isArray(editingSchedule.assignedStaff) && editingSchedule.assignedStaff.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editingSchedule.assignedStaff.map((s) => {
                        const sid = getStaffId(s);
                        const name = getStaffName(s);
                        return (
                          <span key={sid} className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {name}
                            <button
                              onClick={() => setEditingSchedule({
                                ...editingSchedule,
                                assignedStaff: editingSchedule.assignedStaff.filter(x => getStaffId(x) !== sid)
                              })}
                              className="ml-1 text-indigo-500 hover:text-indigo-700"
                              title="Remove"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {staffLoading ? (
                      <div className="text-sm text-gray-500 text-center py-4">Loading staff...</div>
                    ) : availableStaff.length > 0 ? (
                      availableStaff
                        .filter(st => !(editingSchedule.assignedStaff || []).some(sel => getStaffId(sel) === getStaffId(st)))
                        .map((staff) => {
                        const staffId = getStaffId(staff);
                        const staffName = getStaffName(staff);
                        return (
                          <label key={staffId} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditingSchedule({
                                    ...editingSchedule,
                                    assignedStaff: [...editingSchedule.assignedStaff, staffId]
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{staffName}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-4">No staff found.</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingSchedule.description}
                    onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <FaSave className="mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedSchedule ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedSchedule.title}</h4>
                  <p className="text-sm text-gray-600">{selectedSchedule.description}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    <span>{toDateOnly(selectedSchedule.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2 text-gray-400" />
                    <span>{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    <span>{selectedSchedule.location}</span>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <FaUsers className="mr-2 text-gray-400" />
                      <span>Assigned Staff</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(selectedSchedule.assignedStaff || []).map((st, idx) => {
                        const name = getStaffName(st);
                        const id = getStaffId(st) || idx;
                        return (
                          <span key={id} className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                            {name}
                          </span>
                        );
                      })}
                      {(!selectedSchedule.assignedStaff || selectedSchedule.assignedStaff.length === 0) && (
                        <span className="text-xs text-gray-500">No staff assigned</span>
                      )}
                    </div>
                  </div>

                  {/* All staff on duty at this location (across schedules in current filters) */}
                  <div className="mt-3">
                    <div className="flex items-center">
                      <FaUsers className="mr-2 text-gray-400" />
                      <span>On duty at this location</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(() => {
                        const setIds = new Set();
                        const duties = [];
                        const locSchedules = getSchedulesAtLocation(selectedSchedule.location);
                        locSchedules.forEach(sch => {
                          (sch.assignedStaff || []).forEach(st => {
                            const sid = getStaffId(st);
                            if (sid && !setIds.has(sid)) {
                              setIds.add(sid);
                              duties.push({ id: sid, name: getStaffName(st) });
                            }
                          });
                        });
                        if (duties.length === 0) {
                          return <span className="text-xs text-gray-500">No staff on duty</span>;
                        }
                        return duties.map(d => (
                          <span key={d.id} className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {d.name}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSchedule.status)}`}>
                    {selectedSchedule.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                    {selectedSchedule.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                    {selectedSchedule.priority}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(selectedSchedule)}
                    className="flex items-center px-3 py-1 text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteSchedule(selectedSchedule._id || selectedSchedule.id)}
                    className="flex items-center px-3 py-1 text-red-600 hover:text-red-900 text-sm"
                  >
                    <FaTrash className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-700">
                <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="mb-4">Select a schedule or location to view details</p>
                <div className="mt-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">Assigned Staff (current view)</h4>
                  {getAssignedStaffSummary().length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getAssignedStaffSummary().map(s => (
                        <span key={s.id} className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No staff assigned in the current filters.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block Staff Management Modal */}
      {showBlockStaffManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Block Staff Management</h2>
                <p className="text-sm text-gray-600 mt-1">Showing only free staff (not assigned to schedules)</p>
              </div>
              <button
                onClick={() => setShowBlockStaffManagement(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                try {
                  return Object.entries(getStaffByBlockAndDepartment()).map(([blockName, departments]) => (
                <div key={blockName} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b pb-2">
                    {blockName}
                  </h3>
                  
                  {Object.entries(departments).map(([dept, staff]) => (
                    <div key={dept} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                          dept === 'Security' ? 'bg-red-500' :
                          dept === 'Medical' ? 'bg-green-500' :
                          dept === 'Administration' ? 'bg-blue-500' :
                          dept === 'Work' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}></span>
                        {dept} ({staff.length} free)
                      </h4>
                      
                      <div className="space-y-2">
                        {staff.map((member) => (
                          <div key={member._id || member.id} className="bg-white rounded p-2 text-xs border">
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className="text-gray-600">{member.position}</div>
                            <div className="text-gray-500">{member.employeeId}</div>
                          </div>
                        ))}
                        
                        {staff.length === 0 && (
                          <div className="text-gray-500 text-xs italic">No {dept.toLowerCase()} staff assigned</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ));
                } catch (error) {
                  console.error('Error rendering block staff modal:', error);
                  return (
                    <div className="col-span-full text-center text-red-500 p-4">
                      Error loading staff information. Please refresh the page.
                    </div>
                  );
                }
              })()}
            </div>

            {/* Add Staff to Block Section */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Staff to Blocks</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onChange={(e) => {
                      const staffId = e.target.value;
                      if (staffId) {
                        const staff = availableStaff.find(s => getStaffId(s) === staffId);
                        setSelectedBlock({ staffId, staff });
                      }
                    }}
                  >
                    <option value="">Choose staff member...</option>
                    {(() => {
                      if (!Array.isArray(availableStaff)) {
                        return <option value="" disabled>No staff available</option>;
                      }
                      
                      // Get currently assigned staff IDs from schedules
                      const assignedStaffIds = new Set();
                      if (Array.isArray(schedules)) {
                        schedules.forEach(schedule => {
                          if (schedule.assignedStaff && Array.isArray(schedule.assignedStaff)) {
                            schedule.assignedStaff.forEach(staff => {
                              const staffId = getStaffId(staff);
                              if (staffId) {
                                assignedStaffIds.add(staffId);
                              }
                            });
                          }
                        });
                      }
                      
                      // Filter to only show free staff
                      let freeStaff = availableStaff.filter(staff => {
                        const staffId = getStaffId(staff);
                        return !assignedStaffIds.has(staffId);
                      });
                      
                      // Filter by location if a location is selected
                      if (newSchedule.location) {
                        const selectedLocation = String(newSchedule.location).toLowerCase();
                        const staffAssignedBlock = String(staff.assignedBlock || '').toLowerCase();
                        const staffPosition = String(staff.position || '').toLowerCase();
                        
                        if (selectedLocation.includes('block a')) {
                          // For Block A locations, show only Block A staff
                          freeStaff = freeStaff.filter(staff => {
                            const assignedBlock = String(staff.assignedBlock || staff?.roleSpecificDetails?.staffDetails?.assignedBlock || '').toLowerCase();
                            return assignedBlock.includes('block a');
                          });
                        } else if (selectedLocation.includes('block b')) {
                          // For Block B locations, show only Block B staff
                          freeStaff = freeStaff.filter(staff => {
                            const assignedBlock = String(staff.assignedBlock || staff?.roleSpecificDetails?.staffDetails?.assignedBlock || '').toLowerCase();
                            return assignedBlock.includes('block b');
                          });
                        } else if (selectedLocation.includes('control room')) {
                          // For Control Room, show only Prison Control Room Officers
                          freeStaff = freeStaff.filter(staff => {
                            const position = String(staff.position || '').toLowerCase();
                            return position.includes('prison control room officer');
                          });
                        }
                        // For Central Facilities and other locations, show all free staff (no additional filtering)
                      }
                      
                      if (freeStaff.length === 0) {
                        const locationType = newSchedule.location ? 
                          (newSchedule.location.toLowerCase().includes('block a') ? 'Block A' :
                           newSchedule.location.toLowerCase().includes('block b') ? 'Block B' :
                           newSchedule.location.toLowerCase().includes('control room') ? 'Control Room' : '') : '';
                        
                        return <option value="" disabled>
                          {locationType ? `No free ${locationType} staff available` : 'No free staff available'}
                        </option>;
                      }
                      
                      return freeStaff.map((staff) => (
                        <option key={getStaffId(staff)} value={getStaffId(staff)}>
                          {staff.name} - {staff.department} - {staff.position}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Block</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onChange={(e) => {
                      if (selectedBlock) {
                        setSelectedBlock(prev => ({ ...prev, blockName: e.target.value }));
                      }
                    }}
                    disabled={!selectedBlock}
                  >
                    <option value="">Choose block...</option>
                    <option value="Block A">Block A</option>
                    <option value="Block B">Block B</option>
                    <option value="Control Room">Control Room</option>
                    <option value="Central Facilities">Central Facilities</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      if (selectedBlock && selectedBlock.staffId && selectedBlock.blockName) {
                        const staff = availableStaff.find(s => getStaffId(s) === selectedBlock.staffId);
                        assignStaffToBlock(selectedBlock.staffId, selectedBlock.blockName, staff.department);
                        setSelectedBlock(null);
                      }
                    }}
                    disabled={!selectedBlock || !selectedBlock.staffId || !selectedBlock.blockName}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Assign Staff
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScheduleMapView;