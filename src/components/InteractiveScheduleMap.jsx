import React, { useState, useEffect } from 'react';
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
  FaExclamationTriangle,
  FaUtensils,
  FaUserFriends,
  FaTools,
  FaBuilding,
  FaSun,
  FaMoon,
  FaEye,
  FaInfoCircle,
  FaUndo,
  FaRobot
} from 'react-icons/fa';

const InteractiveScheduleMap = ({ schedules, onUpdateSchedule, onDeleteSchedule, onAddSchedule, staffMap = {}, getStaffName, filterDate, setFilterDate }) => {
  // Local function to get staff name, using passed function or fallback
  const resolveStaffName = (staff) => {
    if (getStaffName) {
      return getStaffName(staff);
    }
    // Fallback implementation
    if (typeof staff === 'object' && staff.name) {
      return staff.name;
    }
    if (typeof staff === 'string' && staffMap[staff]) {
      return staffMap[staff];
    }
    return 'Unknown Staff';
  };

  // Enhanced facility layout with black blocks and white text for better visibility
  const facilityLocations = {
    // Central Facilities (Main Area) - Black blocks
    'Central Facility - Main Gate': { x: 45, y: 5, color: 'bg-black', icon: 'G', section: 'entrance', size: 'large' },
    'Central Facility - Control Room': { x: 55, y: 15, color: 'bg-black', icon: 'C', section: 'control', size: 'large' },
    'Central Facility - Medical Room': { x: 25, y: 30, color: 'bg-black', icon: <FaHospital />, section: 'central', size: 'medium' },
    'Central Facility - Kitchen': { x: 45, y: 30, color: 'bg-black', icon: <FaUtensils />, section: 'central', size: 'large' },
    'Central Facility - Visitor Area': { x: 65, y: 30, color: 'bg-black', icon: <FaUserFriends />, section: 'central', size: 'medium' },
    'Central Facility - Admin Office': { x: 45, y: 45, color: 'bg-black', icon: 'A', section: 'central', size: 'medium' },
    'Central Facility - Workshop': { x: 45, y: 60, color: 'bg-black', icon: <FaTools />, section: 'central', size: 'medium' },
    'Central Facility - Isolation': { x: 65, y: 60, color: 'bg-black', icon: 'I', section: 'central', size: 'small' },
    
    // Block A (Left Side) - Black blocks
    'Block A - Cells': { x: 8, y: 25, color: 'bg-black', icon: 'A', section: 'block-a', size: 'medium' },
    'Block A - Dining Room': { x: 8, y: 40, color: 'bg-black', icon: <FaUtensils />, section: 'block-a', size: 'small' },
    
    // Block B (Right Side) - Black blocks
    'Block B - Cells': { x: 92, y: 25, color: 'bg-black', icon: 'B', section: 'block-b', size: 'medium' },
    'Block B - Dining Room': { x: 92, y: 40, color: 'bg-black', icon: <FaUtensils />, section: 'block-b', size: 'small' },
  };

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);
  const [filterShift, setFilterShift] = useState('day'); // all, day, night (default to day)
  // filterDate and setFilterDate are now passed as props from parent component
  const currentFilterDate = filterDate || new Date().toISOString().split('T')[0];
  const currentSetFilterDate = setFilterDate || (() => {});
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [availableStaffForEdit, setAvailableStaffForEdit] = useState([]);
  const [availableStaffForAdd, setAvailableStaffForAdd] = useState([]);
  const [draggedLocation, setDraggedLocation] = useState(null);
  // Disable editing now that layout should be fixed
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [editableLocations, setEditableLocations] = useState(() => {
    // Load saved layout from localStorage on component mount
    const savedLayout = localStorage.getItem('prison-layout-positions');
    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout);
        // Merge saved positions with default positions
        return { ...facilityLocations, ...parsedLayout };
      } catch (error) {
        console.error('Error parsing saved layout:', error);
        return facilityLocations;
      }
    }
    return facilityLocations;
  });
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    type: 'Security',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '21:00',
    location: '',
    assignedStaff: [],
    priority: 'Medium'
  });
  const [currentShift, setCurrentShift] = useState('day');
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);

  // Generate AI schedule function
  const generateAISchedule = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const API_BASE = getApiBase();

      // Determine current shift from filterShift - only allow explicit Day or Night
      if (filterShift === 'all') {
        showError('Please select Day Shift or Night Shift to generate schedules.');
        setLoading(false);
        return;
      }
      const currentShift = filterShift === 'night' ? 'night' : 'day';
      
      const response = await fetch(`${API_BASE}/api/warden/auto-schedule/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: currentFilterDate,
          shift: currentShift
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Show success message
          showSuccess(`Schedule created successfully!`);
        
        // Show critical location warnings if any
        if (data.criticalLocationWarnings && data.criticalLocationWarnings.length > 0) {
          console.warn('🚨 Critical location warnings:', data.criticalLocationWarnings);
          
          // Show each warning as appropriate notification
          data.criticalLocationWarnings.forEach(warning => {
            if (warning.severity === 'critical') {
              showError(warning.message);
            } else if (warning.severity === 'warning') {
              showError(warning.message); // Using error for visibility, could be changed to a warning notification
            }
          });
        }
        
        // Wait a moment for schedules to be saved, then trigger in-app refresh (no full reload)
        setTimeout(async () => {
          if (onAddSchedule) {
            await onAddSchedule();
          }
        }, 1200);
      } else {
        const errorData = await response.json();
        showError(errorData.msg || 'Failed to generate AI schedule');
      }
    } catch (error) {
      console.error('Error generating AI schedule:', error);
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
        showError('Backend server is not running. Please start the server on port 5000.');
      } else {
        showError('Failed to generate AI schedule. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Automatically determine shift based on time changes
  useEffect(() => {
    const shift = getShiftFromTime(newSchedule.startTime, newSchedule.endTime, newSchedule.location);
    setCurrentShift(shift);
  }, [newSchedule.startTime, newSchedule.endTime, newSchedule.location]);

  // Auto-adjust times when location changes to Visitor Area or Workshop
  useEffect(() => {
    if (newSchedule.location && newSchedule.location.includes('Visitor Area')) {
      // If current times are outside visitor area hours, adjust them
      const startHour = parseInt(newSchedule.startTime.split(':')[0]);
      const endHour = parseInt(newSchedule.endTime.split(':')[0]);
      
      if (startHour < 9 || startHour >= 18 || endHour <= 9 || endHour > 18) {
        setNewSchedule(prev => ({
          ...prev,
          startTime: '09:00',
          endTime: '18:00'
        }));
      }
    } else if (newSchedule.location && newSchedule.location.includes('Workshop')) {
      // If current times are outside workshop hours, adjust them
      const startHour = parseInt(newSchedule.startTime.split(':')[0]);
      const endHour = parseInt(newSchedule.endTime.split(':')[0]);
      
      if (startHour < 8 || startHour >= 17 || endHour <= 8 || endHour > 17) {
        setNewSchedule(prev => ({
          ...prev,
          startTime: '08:00',
          endTime: '17:00'
        }));
      }
    }
  }, [newSchedule.location]);

  // Load available staff when location, date, or shift changes in Add Schedule modal
  useEffect(() => {
    if (showAddSchedule && newSchedule.location && newSchedule.date) {
      loadAvailableStaffForAdd(newSchedule.location, newSchedule.date, currentShift);
    }
  }, [showAddSchedule, newSchedule.location, newSchedule.date, currentShift]);

  // API helpers
  const getApiBase = () => (typeof window !== 'undefined' && window.location && window.location.origin.includes('localhost')) ? 'http://localhost:5000' : '';
  const getToken = () => (sessionStorage.getItem('token') || localStorage.getItem('token'));

  // Location mapping function to convert frontend names to backend enum values
  const mapLocationToBackend = (frontendLocation) => {
    const locationMap = {
      'Central Facility - Main Gate': 'Main Gate',
      'Central Facility - Control Room': 'Control Room',
      'Central Facility - Medical Room': 'Medical Room',
      'Central Facility - Kitchen': 'Kitchen',
      'Central Facility - Visitor Area': 'Visitor Area',
      'Central Facility - Admin Office': 'Admin Office',
      'Central Facility - Workshop': 'Workshop',
      'Central Facility - Isolation': 'Isolation',
      'Block A - Cells': 'Block A - Cells',
      'Block A - Dining Room': 'Block A - Dining Room',
      'Block A - Yard': 'Block A - Yard',
      'Block A - Common Area': 'Block A - Common Area',
      'Block B - Cells': 'Block B - Cells',
      'Block B - Dining Room': 'Block B - Dining Room',
      'Block B - Yard': 'Block B - Yard',
      'Block B - Common Area': 'Block B - Common Area'
    };
    
    return locationMap[frontendLocation] || frontendLocation;
  };

  // Function to automatically determine shift based on time and location
  const getShiftFromTime = (startTime, endTime, location = '') => {
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    // Special handling for Visitor Area - only day shift (9:00-18:00)
    if (location && location.includes('Visitor Area')) {
      // For Visitor Area, only allow day shift from 9:00 AM to 6:00 PM
      if (startHour >= 9 && endHour <= 18) {
        return 'day';
      }
      // If outside visitor area hours, still return 'day' but validation will catch it
      return 'day';
    }
    
    // Special handling for Workshop - only day shift (8:00-17:00)
    if (location && location.includes('Workshop')) {
      // For Workshop, only allow day shift from 8:00 AM to 5:00 PM
      if (startHour >= 8 && endHour <= 17) {
        return 'day';
      }
      // If outside workshop hours, still return 'day' but validation will catch it
      return 'day';
    }
    
    // For other locations, use normal shift logic
    // Night shift: 9:00 PM - 9:00 AM (21:00 - 09:00)
    // Check if it's a night shift that spans midnight
    if (startHour >= 21 || (startHour >= 21 && endHour <= 9) || (startHour < 9 && endHour <= 9)) {
      return 'night';
    }
    
    // Day shift: 9:00 AM - 9:00 PM (09:00 - 21:00)
    if (startHour >= 9 && endHour <= 21) {
      return 'day';
    }
    
    // Default to day shift if time spans both shifts
    return 'day';
  };

  // Get schedules for selected location and filters
  const getSchedulesForLocation = (location) => {
    // Step 1: filter by location/date/shift - ONLY show real schedules from database
    const filtered = schedules.filter(schedule => {
      const mappedLocation = mapLocationToBackend(location);
      const matchesLocation = schedule.location === mappedLocation;
      const matchesDate = !currentFilterDate || new Date(schedule.date).toISOString().split('T')[0] === currentFilterDate;
      const matchesShift = filterShift === 'all' || (schedule.shift || 'day') === filterShift;
      
      // CRITICAL: Only show schedules that have a real _id (from database)
      const isRealSchedule = schedule._id && !schedule.clientMirror;
      
      return matchesLocation && matchesDate && matchesShift && isRealSchedule;
    });

    // Step 2: merge duplicates (same location+date+start+end+shift) by combining assignedStaff
    const byKey = new Map();
    for (const sch of filtered) {
      const key = [
        sch.location,
        new Date(sch.date).toISOString().split('T')[0],
        sch.startTime,
        sch.endTime,
        sch.shift || 'day'
      ].join('|');

      if (!byKey.has(key)) {
        byKey.set(key, {
          ...sch,
          assignedStaff: [...(sch.assignedStaff || [])]
        });
      } else {
        const existing = byKey.get(key);
        const existingIds = new Set((existing.assignedStaff || []).map(s => (typeof s === 'object' ? s._id : s)));
        for (const st of sch.assignedStaff || []) {
          const id = typeof st === 'object' ? st._id : st;
          if (!existingIds.has(id)) {
            existing.assignedStaff.push(st);
            existingIds.add(id);
          }
        }
      }
    }
    
    // Step 3: Remove any client-side mirror schedules that might be causing duplicates
    const finalSchedules = Array.from(byKey.values()).filter(schedule => {
      // Only show real schedules (not client-side mirrors) unless they're specifically needed
      return !schedule.clientMirror;
    });
    
    return finalSchedules;
  };

  // Get schedules for a specific shift (ignoring current filterShift)
  const getSchedulesForLocationByShift = (location, shift) => {
    const mappedLocation = mapLocationToBackend(location);
    const filtered = schedules.filter(schedule => {
      const matchesLocation = schedule.location === mappedLocation;
      const matchesDate = !currentFilterDate || new Date(schedule.date).toISOString().split('T')[0] === currentFilterDate;
      const isRealSchedule = schedule._id && !schedule.clientMirror;
      const matchesShift = (schedule.shift || 'day') === shift;
      return matchesLocation && matchesDate && matchesShift && isRealSchedule;
    });
    // Merge duplicates like the main function
    const byKey = new Map();
    for (const sch of filtered) {
      const key = [
        sch.location,
        new Date(sch.date).toISOString().split('T')[0],
        sch.startTime,
        sch.endTime,
        sch.shift || 'day'
      ].join('|');
      if (!byKey.has(key)) {
        byKey.set(key, { ...sch });
      } else {
        const existing = byKey.get(key);
        const mergedStaff = Array.from(new Set([...(existing.assignedStaff || []), ...(sch.assignedStaff || [])]));
        byKey.set(key, { ...existing, assignedStaff: mergedStaff });
      }
    }
    return Array.from(byKey.values());
  };

  // Get schedule count for location
  const getScheduleCount = (location) => {
    const schedulesForLocation = getSchedulesForLocation(location);
    return schedulesForLocation.length;
  };

  // Get total staff count for location
  const getTotalStaffCount = (location) => {
    return getSchedulesForLocation(location).reduce((total, schedule) => {
      return total + (schedule.assignedStaff?.length || 0);
    }, 0);
  };

  // Get staff names for location
  const getStaffNames = (location) => {
    const staffNames = [];
    getSchedulesForLocation(location).forEach(schedule => {
      if (schedule.assignedStaff && Array.isArray(schedule.assignedStaff)) {
        schedule.assignedStaff.forEach(staff => {
          const name = resolveStaffName(staff);
          if (name && !staffNames.includes(name)) {
            staffNames.push(name);
          }
        });
      }
    });
    return staffNames;
  };

  // Handle location click
  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    const locationSchedules = getSchedulesForLocation(location);
    if (locationSchedules.length > 0) {
      setSelectedSchedule(locationSchedules[0]);
      setShowScheduleDetails(true);
    } else {
      setSelectedSchedule(null);
      setShowScheduleDetails(false);
    }
  };

  // Get required department for location
  const getRequiredDepartment = (location) => {
    if (location.includes('Medical')) {
      return 'Medical';
    } else if (location.includes('Admin') || location.includes('Office')) {
      return 'Administration';
    } else if (location.includes('Control')) {
      return 'Security'; // Special case: Prison Control Room Officer
    } else {
      // For all other locations (Cells, Dining Room, Kitchen, Workshop, Visitor Area, Main Gate, Isolation, etc.)
      return 'Security';
    }
  };

  // Filter staff by department
  const filterStaffByDepartment = (staff, requiredDepartment, location = '') => {
    if (!requiredDepartment) {
      return staff; // No filtering if no specific department required
    }
    
    return staff.filter(member => {
      const department = member.staffDetails?.department || '';
      const position = member.staffDetails?.position || '';
      
      // Special case for Control Room - only Prison Control Room Officer
      if (location.includes('Control Room')) {
        return position.toLowerCase().includes('prison control room officer');
      }
      
      // Special cases for Medical and Admin - show only their department
      if (location.includes('Medical')) {
        return department.toLowerCase().includes('medical') || 
               position.toLowerCase().includes('medical');
      }
      
      if (location.includes('Admin') || location.includes('Office')) {
        return department.toLowerCase().includes('administration') || 
               department.toLowerCase().includes('admin') ||
               position.toLowerCase().includes('administration') ||
               position.toLowerCase().includes('admin');
      }
      
      // For all other locations (Security staff for everything else)
      return department.toLowerCase().includes('security') ||
             position.toLowerCase().includes('security') ||
             position.toLowerCase().includes('guard') ||
             position.toLowerCase().includes('officer');
    });
  };

  // Function to save layout positions to localStorage
  const saveLayoutPositions = (locations) => {
    try {
      // Extract only the position data (x, y) for each location
      const positionData = Object.keys(locations).reduce((acc, location) => {
        acc[location] = {
          x: locations[location].x,
          y: locations[location].y
        };
        return acc;
      }, {});
      
      localStorage.setItem('prison-layout-positions', JSON.stringify(positionData));
      console.log('✅ Layout positions saved to localStorage:', positionData);
      // Replaced blocking alert with non-intrusive toast-like banner
      const toast = document.createElement('div');
      toast.textContent = 'Layout saved';
      toast.style.position = 'fixed';
      toast.style.top = '16px';
      toast.style.right = '16px';
      toast.style.zIndex = '9999';
      toast.style.background = '#22c55e';
      toast.style.color = 'white';
      toast.style.padding = '10px 14px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    } catch (error) {
      console.error('Error saving layout positions:', error);
    }
  };

  // Function to reset layout to default positions
  const resetLayoutPositions = () => {
    try {
      localStorage.removeItem('prison-layout-positions');
      setEditableLocations(facilityLocations);
      console.log('🔄 Layout reset to default positions');
      const toast = document.createElement('div');
      toast.textContent = 'Layout reset to defaults';
      toast.style.position = 'fixed';
      toast.style.top = '16px';
      toast.style.right = '16px';
      toast.style.zIndex = '9999';
      toast.style.background = '#6366f1';
      toast.style.color = 'white';
      toast.style.padding = '10px 14px';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    } catch (error) {
      console.error('Error resetting layout positions:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, location) => {
    e.preventDefault();
    setDraggedLocation(location);
    
    // Add global mouse event listeners
    const handleGlobalMouseMove = (e) => {
      const rect = document.querySelector('.map-container')?.getBoundingClientRect();
      if (!rect) return;
      
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Constrain to map bounds and keep items inside their section (Block A / Central Facility / Block B)
      const sectionPadding = 2.5; // percentage padding inside each section
      // Sections are laid out as: Block A (0-25), Central (25-75), Block B (75-100)
      const getSectionBounds = (loc) => {
        if (loc?.includes('Block A')) {
          return { min: 0 + sectionPadding, max: 25 - sectionPadding };
        }
        if (loc?.includes('Block B')) {
          return { min: 75 + sectionPadding, max: 100 - sectionPadding };
        }
        // Default to Central Facility
        return { min: 25 + sectionPadding, max: 75 - sectionPadding };
      };
      const { min, max } = getSectionBounds(location);

      // Clamp x to section range; clamp y to overall map safe area
      const constrainedX = Math.max(min, Math.min(max, x));
      const constrainedY = Math.max(5, Math.min(95, y));
      
      setEditableLocations(prev => ({
        ...prev,
        [location]: {
          ...prev[location],
          x: constrainedX,
          y: constrainedY
        }
      }));
    };
    
    const handleGlobalMouseUp = () => {
      setDraggedLocation(null);
      // Save the current layout positions
      saveLayoutPositions(editableLocations);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  // Load available staff for editing
  const loadAvailableStaffForEdit = async (schedule) => {
    try {
      const token = getToken();
      const API_BASE = getApiBase();
      
      // Get all staff first
      let allStaff = [];
      let endpoint = '';
      
      // Determine which endpoint to use based on location
      const shift = schedule.shift || 'day'; // Default to day shift if not specified
      // Format date properly for API
      const dateStr = new Date(schedule.date).toISOString().split('T')[0];
      if (schedule.location.includes('Central Facility') || schedule.location.includes('Main Gate') || schedule.location.includes('Control Room')) {
        endpoint = `${API_BASE}/api/warden/staff/available/central?date=${dateStr}&shift=${shift}`;
      } else if (schedule.location.includes('Block A')) {
        endpoint = `${API_BASE}/api/warden/staff/available/blocks?date=${dateStr}&shift=${shift}&blockType=A`;
      } else if (schedule.location.includes('Block B')) {
        endpoint = `${API_BASE}/api/warden/staff/available/blocks?date=${dateStr}&shift=${shift}&blockType=B`;
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          allStaff = data.staff || [];
        } else {
          console.error('Failed to fetch available staff:', response.status, response.statusText);
        }
      }

      // Filter by department first
      const requiredDepartment = getRequiredDepartment(schedule.location);
      const departmentFilteredStaff = filterStaffByDepartment(allStaff, requiredDepartment, schedule.location);

      // Filter out staff who are already scheduled on the same date (both same and opposite shifts)
      const currentlyScheduledStaff = schedules
        .filter(s => {
          const scheduleDate = new Date(s.date).toISOString().split('T')[0];
          const currentDate = new Date(schedule.date).toISOString().split('T')[0];
          return scheduleDate === currentDate && s._id !== schedule._id;
        })
        .flatMap(s => s.assignedStaff || []);

      // Extract staff IDs from populated objects
      const currentlyScheduledStaffIds = currentlyScheduledStaff.map(staff => 
        typeof staff === 'object' ? staff._id : staff
      );

      // Get free staff (not currently scheduled for the same date)
      const freeStaff = departmentFilteredStaff.filter(staff => 
        !currentlyScheduledStaffIds.some(scheduledStaffId => 
          scheduledStaffId.toString() === staff._id.toString()
        )
      );


      setAvailableStaffForEdit(freeStaff);
    } catch (error) {
      console.error('Error loading available staff:', error);
      showError('Failed to load available staff');
    }
  };

  // Load available staff for Add Schedule modal
  const loadAvailableStaffForAdd = async (location, date, shift) => {
    try {
      const token = getToken();
      const API_BASE = getApiBase();
      let endpoint = '';
      
      // Determine which endpoint to use based on location
      if (location.includes('Central Facility') || location.includes('Medical Room') || location.includes('Main Gate') || location.includes('Control Room')) {
        endpoint = `${API_BASE}/api/warden/staff/available/central?date=${date}&shift=${shift}`;
      } else if (location.includes('Block A')) {
        endpoint = `${API_BASE}/api/warden/staff/available/blocks?date=${date}&shift=${shift}&blockType=A`;
      } else if (location.includes('Block B')) {
        endpoint = `${API_BASE}/api/warden/staff/available/blocks?date=${date}&shift=${shift}&blockType=B`;
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const allStaff = data.staff || [];
          
          // Filter by department first
          const requiredDepartment = getRequiredDepartment(location);
          const departmentFilteredStaff = filterStaffByDepartment(allStaff, requiredDepartment, location);
          
          // Debug logging for medical staff issue
          if (location.includes('Medical')) {
            console.log('Medical staff debugging:', {
              location,
              requiredDepartment,
              allStaffCount: allStaff.length,
              departmentFilteredCount: departmentFilteredStaff.length,
              allStaff: allStaff.map(s => ({ name: s.name, department: s.staffDetails?.department, position: s.staffDetails?.position })),
              departmentFiltered: departmentFilteredStaff.map(s => ({ name: s.name, department: s.staffDetails?.department, position: s.staffDetails?.position }))
            });
          }
          
          // Filter out staff who are already scheduled on the same date (both same and opposite shifts)
          const currentlyScheduledStaff = schedules
            .filter(s => {
              const scheduleDate = new Date(s.date).toISOString().split('T')[0];
              const currentDate = new Date(date).toISOString().split('T')[0];
              return scheduleDate === currentDate;
            })
            .flatMap(s => s.assignedStaff || []);

          // Extract staff IDs from populated objects
          const currentlyScheduledStaffIds = currentlyScheduledStaff.map(staff => 
            typeof staff === 'object' ? staff._id : staff
          );

          // Build carry-over list from previous day based on selected shift
          const currentDateStr = new Date(date).toISOString().split('T')[0];
          const prev = new Date(date);
          prev.setDate(prev.getDate() - 1);
          const prevDateStr = prev.toISOString().split('T')[0];

          const getId = (x) => (typeof x === 'object' ? x._id?.toString() : x?.toString());

          // Yesterday staff for same shift
          const yesterdayShiftStaffIds = schedules
            .filter(s => new Date(s.date).toISOString().split('T')[0] === prevDateStr && (s.shift || 'day') === (shift || 'day'))
            .flatMap(s => s.assignedStaff || [])
            .map(getId);

          // Start from department-filtered staff and include ALL free staff,
          // but prioritize yesterday's same-shift staff at the top of the list
          let candidate = departmentFilteredStaff;
          const prioritySet = new Set(yesterdayShiftStaffIds);

          // Filter out staff who are already scheduled today (any shift)
          let freeStaff = candidate.filter(staff => {
            const id = staff._id.toString();
            const inCurrentBlock = currentlyScheduledStaffIds.includes(id);
            return !inCurrentBlock;
          });

          // Sort so that yesterday's same-shift staff appear first
          if (prioritySet.size > 0) {
            freeStaff = freeStaff.sort((a, b) => {
              const aP = prioritySet.has(a._id.toString()) ? 0 : 1;
              const bP = prioritySet.has(b._id.toString()) ? 0 : 1;
              return aP - bP;
            });
          }

          setAvailableStaffForAdd(freeStaff);
        }
      }
    } catch (error) {
      console.error('Error loading available staff for Add Schedule:', error);
    }
  };

  // Handle editing schedule
  const handleEditSchedule = async (schedule) => {
    // Ensure assignedStaff is properly formatted
    const formattedSchedule = {
      ...schedule,
      assignedStaff: schedule.assignedStaff || []
    };
    setEditingSchedule(formattedSchedule);
    setShowEditSchedule(true);
    await loadAvailableStaffForEdit(formattedSchedule);
  };

  // Real-time validation for edit schedule form
  const validateEditScheduleForm = () => {
    const errors = [];

    if (!editingSchedule) {
      errors.push('No schedule selected for editing');
      return errors;
    }

    if (!editingSchedule.location) {
      errors.push('Location is required');
    }

    if (!editingSchedule.date) {
      errors.push('Date is required');
    }

    if (!editingSchedule.startTime) {
      errors.push('Start time is required');
    }

    if (!editingSchedule.endTime) {
      errors.push('End time is required');
    }

    if (editingSchedule.startTime && editingSchedule.endTime) {
      const start = new Date(`2000-01-01T${editingSchedule.startTime}`);
      const end = new Date(`2000-01-01T${editingSchedule.endTime}`);
      
      // Check if this is a night shift (spans midnight)
      const isNightShift = start.getHours() >= 21 || end.getHours() <= 9;
      
      if (isNightShift) {
        // For night shifts, end time can be earlier (next day)
        // Only validate if it's the same day and end is before start
        if (start.getHours() < 21 && end.getHours() > 9) {
          errors.push('End time must be after start time');
        }
      } else {
        // For day shifts, normal validation
        if (end <= start) {
          errors.push('End time must be after start time');
        }
      }
    }

    if (!editingSchedule.assignedStaff || editingSchedule.assignedStaff.length === 0) {
      errors.push('At least one staff member must be assigned');
    }

    return errors;
  };

  // Handle updating schedule
  const handleUpdateSchedule = async () => {
    // Real-time validation
    const validationErrors = validateEditScheduleForm();
    if (validationErrors.length > 0) {
      showError(validationErrors.join('. ') + '.');
      return;
    }

    try {
      const token = getToken();
      const API_BASE = getApiBase();
      
      // Ensure assignedStaff contains only IDs, not objects
      const assignedStaffIds = editingSchedule.assignedStaff.map(staff => 
        typeof staff === 'object' ? staff._id : staff
      );

      const response = await fetch(`${API_BASE}/api/warden/schedules/${editingSchedule._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editingSchedule,
          assignedStaff: assignedStaffIds
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Send email notifications to assigned staff
        try {
          const emailResponse = await fetch(`${API_BASE}/api/warden/schedules/${editingSchedule._id}/notify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'schedule_update',
              scheduleId: editingSchedule._id,
              assignedStaff: assignedStaffIds
            })
          });
          
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            showSuccess('Schedule updated and sent mail to staffs');
          } else {
            const errorData = await emailResponse.json();
            console.error('Email notification failed:', errorData);
            showSuccess('Schedule updated and sent mail to staffs');
          }
        } catch (emailError) {
          console.error('Email notification error:', emailError);
          showSuccess('Schedule updated and sent mail to staffs');
        }
        
        setShowEditSchedule(false);
        setEditingSchedule(null);
        if (onUpdateSchedule) {
          onUpdateSchedule(data.schedule);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Schedule update failed:', errorData);
        
        // Provide specific error messages based on the response
        if (errorData.msg) {
          showError(errorData.msg);
        } else if (response.status === 400) {
          showError('Invalid schedule data. Please check all fields.');
        } else if (response.status === 401) {
          showError('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          showError('You do not have permission to update schedules.');
        } else if (response.status === 404) {
          showError('Schedule not found. It may have been deleted.');
        } else if (response.status === 409) {
          showError('A schedule already exists for this location, date, and time.');
        } else {
          showError('Failed to update schedule. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError('Network error. Please check your connection and try again.');
      } else {
        showError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Handle adding new schedule
  // Real-time validation for schedule form
  const validateScheduleForm = () => {
    const errors = [];

    if (!newSchedule.title || newSchedule.title.trim() === '') {
      errors.push('Schedule title is required');
    }

    if (!newSchedule.location) {
      errors.push('Location is required');
    }

    if (!newSchedule.date) {
      errors.push('Date is required');
    }

    if (!newSchedule.startTime) {
      errors.push('Start time is required');
    }

    if (!newSchedule.endTime) {
      errors.push('End time is required');
    }

    if (newSchedule.startTime && newSchedule.endTime) {
      const start = new Date(`2000-01-01T${newSchedule.startTime}`);
      const end = new Date(`2000-01-01T${newSchedule.endTime}`);
      
      // Special validation for Visitor Area - only allow 9:00-18:00
      if (newSchedule.location && newSchedule.location.includes('Visitor Area')) {
        const startHour = start.getHours();
        const endHour = end.getHours();
        
        if (startHour < 9 || startHour >= 18) {
          errors.push('Visitor Area start time must be between 9:00 AM and 6:00 PM');
        }
        if (endHour <= 9 || endHour > 18) {
          errors.push('Visitor Area end time must be between 9:00 AM and 6:00 PM');
        }
        if (end <= start) {
          errors.push('End time must be after start time');
        }
      } else if (newSchedule.location && newSchedule.location.includes('Workshop')) {
        // Special validation for Workshop - only allow 8:00-17:00
        const startHour = start.getHours();
        const endHour = end.getHours();
        
        if (startHour < 8 || startHour >= 17) {
          errors.push('Workshop start time must be between 8:00 AM and 5:00 PM');
        }
        if (endHour <= 8 || endHour > 17) {
          errors.push('Workshop end time must be between 8:00 AM and 5:00 PM');
        }
        if (end <= start) {
          errors.push('End time must be after start time');
        }
      } else {
        // For other locations, use normal shift validation
        // Check if this is a night shift (spans midnight)
        const isNightShift = start.getHours() >= 21 || end.getHours() <= 9;
        
        if (isNightShift) {
          // For night shifts, end time can be earlier (next day)
          // Only validate if it's the same day and end is before start
          if (start.getHours() < 21 && end.getHours() > 9) {
            errors.push('End time must be after start time');
          }
        } else {
          // For day shifts, normal validation
          if (end <= start) {
            errors.push('End time must be after start time');
          }
        }
      }
    }

    if (!newSchedule.assignedStaff || newSchedule.assignedStaff.length === 0) {
      errors.push('At least one staff member must be assigned');
    }

    return errors;
  };

  // Real-time field validation
  const validateField = (field, value) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'title':
        if (!value || value.trim() === '') {
          errors.title = 'Schedule title is required';
        } else {
          delete errors.title;
        }
        break;
      case 'location':
        if (!value) {
          errors.location = 'Location is required';
        } else {
          delete errors.location;
        }
        break;
      case 'date':
        if (!value) {
          errors.date = 'Date is required';
        } else {
          delete errors.date;
        }
        break;
      case 'startTime':
        if (!value) {
          errors.startTime = 'Start time is required';
        } else if (newSchedule.endTime) {
          const start = new Date(`2000-01-01T${value}`);
          const end = new Date(`2000-01-01T${newSchedule.endTime}`);
          
          // Check if this is a night shift (spans midnight)
          const isNightShift = start.getHours() >= 21 || end.getHours() <= 9;
          
          if (isNightShift) {
            // For night shifts, start time can be later than end time (next day)
            // Only validate if it's the same day and start is after end
            if (start.getHours() < 21 && end.getHours() > 9) {
              errors.startTime = 'Start time must be before end time';
            } else {
              delete errors.startTime;
            }
          } else {
            // For day shifts, normal validation
            if (start >= end) {
              errors.startTime = 'Start time must be before end time';
            } else {
              delete errors.startTime;
            }
          }
        } else {
          delete errors.startTime;
        }
        break;
      case 'endTime':
        if (!value) {
          errors.endTime = 'End time is required';
        } else if (newSchedule.startTime) {
          const start = new Date(`2000-01-01T${newSchedule.startTime}`);
          const end = new Date(`2000-01-01T${value}`);
          
          // Check if this is a night shift (spans midnight)
          const isNightShift = start.getHours() >= 21 || end.getHours() <= 9;
          
          if (isNightShift) {
            // For night shifts, end time can be earlier (next day)
            // Only validate if it's the same day and end is before start
            if (start.getHours() < 21 && end.getHours() > 9) {
              errors.endTime = 'End time must be after start time';
            } else {
              delete errors.endTime;
            }
          } else {
            // For day shifts, normal validation
            if (end <= start) {
              errors.endTime = 'End time must be after start time';
            } else {
              delete errors.endTime;
            }
          }
        } else {
          delete errors.endTime;
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleAddSchedule = async () => {
    // Real-time validation - check all fields and update validation state
    const validationErrors = validateScheduleForm();
    if (validationErrors.length > 0) {
      // Set validation errors in state to show inline errors
      const fieldErrors = {};
      validationErrors.forEach(error => {
        if (error.includes('title')) fieldErrors.title = error;
        if (error.includes('Location')) fieldErrors.location = error;
        if (error.includes('Start time')) fieldErrors.startTime = error;
        if (error.includes('End time')) fieldErrors.endTime = error;
        if (error.includes('staff member')) {
          // Don't set field error for staff - just show toast for this
          showError(error);
          return;
        }
      });
      setValidationErrors(fieldErrors);
      return;
    }

    try {
      const token = getToken();
      const API_BASE = getApiBase();
      
      // Prepare schedule data without invalid fields
      const scheduleData = {
        title: newSchedule.title || `${newSchedule.type} Schedule`,
        type: newSchedule.type,
        description: newSchedule.description,
        date: newSchedule.date,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        location: mapLocationToBackend(newSchedule.location), // Map frontend location to backend enum
        assignedStaff: newSchedule.assignedStaff,
        priority: newSchedule.priority,
        shift: currentShift // Include the automatically determined shift
      };
      
      
      const response = await fetch(`${API_BASE}/api/warden/schedules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Schedule created successfully!');
        setShowAddSchedule(false);
        setValidationErrors({}); // Clear validation errors on success
        setNewSchedule({
          title: '',
          type: 'Security',
          description: '',
          date: currentFilterDate,
          startTime: '09:00',
          endTime: '21:00',
          location: '',
          assignedStaff: [],
          priority: 'Medium'
        });
        if (onAddSchedule) {
          onAddSchedule(data.schedule);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Schedule creation failed:', errorData);
        
        // Provide specific error messages based on the response
        if (errorData.msg) {
          showError(errorData.msg);
        } else if (response.status === 400) {
          showError('Invalid schedule data. Please check all fields.');
        } else if (response.status === 401) {
          showError('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          showError('You do not have permission to create schedules.');
        } else if (response.status === 409) {
          showError('A schedule already exists for this location, date, and time.');
        } else {
          showError('Failed to create schedule. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ Error creating schedule:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError('Network error. Please check your connection and try again.');
      } else {
        showError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Removed unused functions - only showing staff count now

  // Group locations by section
  const locationsBySection = Object.entries(facilityLocations).reduce((acc, [location, data]) => {
    if (!acc[data.section]) {
      acc[data.section] = [];
    }
    acc[data.section].push({ location, ...data });
    return acc;
  }, {});

  // Handle saving all schedules and sending emails
  const handleSaveAllSchedules = async () => {
    try {
      const token = getToken();
      const API_BASE = getApiBase();
      
      console.log('💾 Saving all schedules and sending emails...');
      
      // Get schedules for the selected date (and current shift filter if not 'all') that have staff
      const selectedDate = currentFilterDate ? new Date(currentFilterDate).toISOString().split('T')[0] : null;
      const schedulesWithStaff = schedules.filter(schedule => {
        const hasStaff = Array.isArray(schedule.assignedStaff) && schedule.assignedStaff.length > 0;
        const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
        const matchesDate = selectedDate ? scheduleDate === selectedDate : true;
        const matchesShift = (schedule.shift || 'day') === filterShift;
        return hasStaff && matchesDate && matchesShift;
      });
      
      if (schedulesWithStaff.length === 0) {
        showError('No schedules with assigned staff found to save');
        return;
      }
      
      
      let successCount = 0;
      let emailCount = 0;
      const errors = [];
      
      // Process each schedule
      for (const schedule of schedulesWithStaff) {
        try {
          const emailResponse = await fetch(`${API_BASE}/api/warden/schedules/${schedule._id}/notify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'schedule_update',
              scheduleId: schedule._id,
              assignedStaff: schedule.assignedStaff
            })
          });
          
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            emailCount += emailData.results?.filter(r => r.success).length || 0;
            successCount++;
          } else {
            const errorData = await emailResponse.json();
            console.error(`Email failed for schedule ${schedule._id}:`, errorData);
            errors.push(`Schedule ${schedule.title}: Email failed`);
          }
        } catch (error) {
          console.error(`Error processing schedule ${schedule._id}:`, error);
          errors.push(`Schedule ${schedule.title}: ${error.message}`);
        }
      }
      
      // Show results
      if (successCount === schedulesWithStaff.length) {
        showSuccess(`Schedule created successfully!`);
      } else if (successCount > 0) {
        showSuccess(`Email sent`);
      } else {
        showError('❌ Failed to process any schedules. Please check the console for details.');
      }
      
      if (errors.length > 0) {
        console.error('📧 Errors encountered:', errors);
      }
      
    } catch (error) {
      console.error('💾 Error saving all schedules:', error);
      showError('Failed to save schedules and send emails. Please try again.');
    }
  };

  return (
    <div className="flex w-full items-start gap-4 flex-nowrap">
      {/* Map Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 min-w-0">
      {/* Main Map Area */}
      <div className="p-4">
        <div className="h-full">
          {/* Map Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">🏛️ Prison Management System</h2>
                <p className="text-gray-600 mt-1 text-base">Interactive Staff Assignment & Schedule Management</p>
                <p className="text-xs text-gray-500">Click locations to assign staff • Drag blocks in edit mode</p>
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-4">
                {/* AI Scheduling Button */}
                <button
                  onClick={generateAISchedule}
                  disabled={loading}
                  className="px-3 py-2 rounded-lg font-medium text-sm shadow-lg transition-all duration-200 flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  title="Generate AI-optimized schedule for current date and shift"
                >
                  <FaRobot className="w-4 h-4" />
                  <span>AI Scheduling</span>
                </button>

                {/* Clear AI Schedule Button */}

                {/* Edit Layout Toggle */}
                <button
                  onClick={() => {
                    setIsEditing((prev) => {
                      const next = !prev;
                      // When turning off edit mode, persist current layout
                      if (prev && !next) {
                        saveLayoutPositions(editableLocations);
                      }
                      return next;
                    });
                  }}
                  className={`px-3 py-2 rounded-lg font-medium text-sm shadow-lg transition-all duration-200 flex items-center space-x-2 ${
                    isEditing
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={isEditing ? 'Finish editing layout' : 'Enable drag-and-drop to move blocks'}
                >
                  {isEditing ? <FaSave className="w-4 h-4" /> : <FaEdit className="w-4 h-4" />}
                  <span>{isEditing ? 'Done' : 'Edit Layout'}</span>
                </button>

                {isEditing && (
                  <button
                    onClick={() => resetLayoutPositions()}
                    className="px-3 py-2 rounded-lg font-medium text-sm shadow-lg transition-all duration-200 flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    title="Reset layout to defaults"
                  >
                    <FaUndo className="w-4 h-4" />
                    <span>Reset Layout</span>
                  </button>
                )}

                <select
                  value={filterShift}
                  onChange={(e) => setFilterShift(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="all">All Shifts</option>
                </select>
                
                <input
                  type="date"
                  value={currentFilterDate}
                  onChange={(e) => currentSetFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                
                {/* Save Button */}
                <button
                  onClick={handleSaveAllSchedules}
                  disabled={schedules.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save</span>
                </button>
                
              </div>
            </div>
          </div>

          {/* Map Content */}
          <div className="p-4 h-full overflow-auto">
            <div className="relative h-full min-h-[380px] max-h-[420px]">
              
              {/* Decorative Corner Elements */}
              <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-1 left-1 w-2 h-2 bg-gradient-to-br from-green-400 to-blue-600 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-gradient-to-br from-orange-400 to-red-600 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1.5s'}}></div>
               {/* Map Background */}
               <div className="map-container absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg overflow-hidden">
                 
                 {/* Subtle Grid Pattern */}
                 <div className="absolute inset-0 opacity-10" style={{
                   backgroundImage: `
                     linear-gradient(to right, rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                     linear-gradient(to bottom, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
                   `,
                   backgroundSize: '40px 40px'
                 }}></div>
                 
                 {/* Section Dividers and Labels */}
                 <div className="absolute inset-0 flex">
                   {/* Block A Section - Reduced Width */}
                   <div className="w-1/4 relative bg-gradient-to-b from-blue-100/30 to-blue-200/20">
                     <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg"></div>
                     <div className="absolute top-3 left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-lg border border-blue-400">
                       🏢 Block A
                     </div>
                   </div>
                   
                   {/* Central Facility Section - Increased Width */}
                   <div className="w-1/2 relative bg-gradient-to-b from-purple-100/30 to-purple-200/20">
                     <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600 shadow-lg"></div>
                     <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-md text-sm font-bold shadow-lg border border-purple-400">
                       🏛️ Central Facility
                     </div>
                   </div>
                   
                   {/* Block B Section - Reduced Width */}
                   <div className="w-1/4 relative bg-gradient-to-b from-green-100/30 to-green-200/20">
                     <div className="absolute top-3 left-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-lg border border-green-400">
                       🏢 Block B
                     </div>
                   </div>
                 </div>

                {/* Render Locations */}
                {Object.entries(editableLocations).map(([location, data]) => {
                  const scheduleCount = getScheduleCount(location);
                  const staffCount = getTotalStaffCount(location);
                  const isSelected = selectedLocation === location;
                  const isHovered = hoveredLocation === location;
                  
                  return (
                    <div
                      key={location}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                        isEditing ? 'cursor-move' : 'cursor-pointer'
                      } ${
                        isSelected ? 'ring-4 ring-indigo-500 ring-opacity-60 scale-110 drop-shadow-2xl' : ''
                      } ${isHovered ? 'scale-110 drop-shadow-xl z-20' : 'hover:scale-105'} ${draggedLocation === location ? 'z-50 scale-125 drop-shadow-2xl' : ''}`}
                      style={{
                        left: `${data.x}%`,
                        top: `${data.y}%`
                      }}
                      onClick={() => !isEditing && handleLocationClick(location)}
                      onMouseEnter={() => setHoveredLocation(location)}
                      onMouseLeave={() => setHoveredLocation(null)}
                      onMouseDown={(e) => isEditing && handleDragStart(e, location)}
                      title={isEditing ? `Drag to move ${location}` : `${location} - Staff: ${staffCount}`}
                      data-tooltip={location}
                    >
                      <div className="text-center">
                         {/* Staff Count Block */}
                         <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-gray-800 shadow-lg hover:shadow-xl transform transition-all duration-300 border-2 border-gray-400">
                           <span className="text-base font-extrabold drop-shadow-lg text-gray-800">{staffCount}</span>
                         </div>
                         {/* Location Name */}
                         <div className="mt-1 text-xs font-semibold text-gray-800 bg-gray-300 shadow-md px-2 py-1 rounded-md whitespace-nowrap max-w-24 border border-gray-400 text-center">
                           {location.split(' - ')[1] || location.split(' - ')[0]}
                         </div>
                       </div>
                    </div>
                  );
                })}

              </div>

            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Schedule Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto min-h-[560px] w-[420px] shrink-0">
        {selectedLocation ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedLocation}
              </h3>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {/* Location Info */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center mb-2">
                <div className={`w-8 h-8 ${facilityLocations[selectedLocation]?.color} rounded-lg flex items-center justify-center text-white mr-3`}>
                  <span className="text-white font-bold text-sm">📍</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedLocation}</p>
                  <p className="text-sm text-gray-600">
                    {facilityLocations[selectedLocation]?.section.replace('-', ' ').toUpperCase()} Section
                  </p>
                </div>
              </div>
              
              {/* Staff Summary */}
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <FaUsers className="h-4 w-4 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Staff</p>
                      <p className="text-lg font-bold text-blue-600">{getTotalStaffCount(selectedLocation)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <FaCalendarAlt className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Schedules</p>
                      <p className="text-lg font-bold text-green-600">{getScheduleCount(selectedLocation)}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Schedules List */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Schedules ({getScheduleCount(selectedLocation)})
              </h4>
              
              {getSchedulesForLocation(selectedLocation).length > 0 ? (
                getSchedulesForLocation(selectedLocation).map((schedule) => {
                  return (
                  <div
                    key={schedule._id || schedule.id}
                    className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer transition-colors ${
                      selectedSchedule?._id === schedule._id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-medium text-gray-900">{schedule.title}</h5>
                          {schedule.isAutoScheduled && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Auto
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            schedule.priority === 'High' ? 'bg-red-100 text-red-800' :
                            schedule.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {schedule.priority}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaClock className="mr-2" />
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="flex items-center">
                            {schedule.shift === 'day' ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
                            {schedule.shift ? (schedule.shift.charAt(0).toUpperCase() + schedule.shift.slice(1)) : 'Day'} Shift
                          </div>
                          <div className="flex items-center">
                            <FaUsers className="mr-2" />
                            {schedule.assignedStaff && schedule.assignedStaff.length > 0 
                              ? schedule.assignedStaff.map(staff => 
                                  resolveStaffName(staff)
                                ).join(', ')
                              : 'No staff assigned'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSchedule(schedule);
                          }}
                          className="p-1 text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteSchedule) {
                              onDeleteSchedule(schedule._id || schedule.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-center mb-4">
                    <FaUsers className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedules</h3>
                    <p className="text-gray-500 mb-4">No schedules have been created for this location yet</p>
                  </div>
                </div>
              )}
              
              {/* Add Staff Button - Disabled for Dining Rooms */}
              <div className="mt-4">
                {selectedLocation && selectedLocation.includes('Dining Room') ? (
                  <div className="w-full flex items-center justify-center px-4 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium">
                    <FaPlus className="mr-2" />
                    Staff Auto-Assigned from Cells
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setNewSchedule(prev => ({ ...prev, location: selectedLocation }));
                      setShowAddSchedule(true);
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <FaPlus className="mr-2" />
                    Add Staff to {selectedLocation}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaMapMarkerAlt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Location</h3>
            <p className="text-gray-600 mb-4">
              Click on any location on the map to manually assign staff
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto min-h-[180px] flex items-center justify-center text-left">
              <p className="text-blue-800 text-sm">
                💡 <strong>Manual Staff Assignment:</strong> Click any block to add schedules and assign staff members manually.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Add Schedule Modal */}
      {showAddSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => {
                    setNewSchedule(prev => ({ ...prev, title: e.target.value }));
                    validateField('title', e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Schedule title"
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={newSchedule.location}
                  onChange={(e) => {
                    const selectedLocation = e.target.value;
                    let startTime = '09:00';
                    let endTime = '21:00';
                    
                    if (selectedLocation && selectedLocation.includes('Visitor Area')) {
                      startTime = '09:00';
                      endTime = '18:00';
                    } else if (selectedLocation && selectedLocation.includes('Workshop')) {
                      startTime = '08:00';
                      endTime = '17:00';
                    }
                    
                    setNewSchedule(prev => ({ 
                      ...prev, 
                      location: selectedLocation,
                      startTime: startTime,
                      endTime: endTime
                    }));
                    validateField('location', selectedLocation);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    validationErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select location</option>
                  {Object.keys(facilityLocations)
                    .filter(location => !location.includes('Dining Room'))
                    .map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                </select>
                {validationErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                )}
              </div>

              {/* Quick Shift Selection Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Shift Selection</label>
                <div className="flex space-x-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      let endTime = '21:00';
                      let startTime = '09:00';
                      
                      if (newSchedule.location && newSchedule.location.includes('Visitor Area')) {
                        endTime = '18:00';
                      } else if (newSchedule.location && newSchedule.location.includes('Workshop')) {
                        startTime = '08:00';
                        endTime = '17:00';
                      }
                      
                      setNewSchedule(prev => ({ 
                        ...prev, 
                        startTime: startTime, 
                        endTime: endTime
                      }));
                    }}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      (() => {
                        if (newSchedule.location && newSchedule.location.includes('Visitor Area')) {
                          return newSchedule.startTime === '09:00' && newSchedule.endTime === '18:00';
                        } else if (newSchedule.location && newSchedule.location.includes('Workshop')) {
                          return newSchedule.startTime === '08:00' && newSchedule.endTime === '17:00';
                        } else {
                          return newSchedule.startTime === '09:00' && newSchedule.endTime === '21:00';
                        }
                      })()
                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaSun className="mr-2" />
                    {(() => {
                      if (newSchedule.location && newSchedule.location.includes('Visitor Area')) {
                        return 'Day (9:00-18:00)';
                      } else if (newSchedule.location && newSchedule.location.includes('Workshop')) {
                        return 'Day (8:00-17:00)';
                      } else {
                        return 'Morning (9:00-21:00)';
                      }
                    })()}
                  </button>
                  {(!newSchedule.location || (!newSchedule.location.includes('Visitor Area') && !newSchedule.location.includes('Workshop'))) && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewSchedule(prev => ({ 
                          ...prev, 
                          startTime: '21:00', 
                          endTime: '09:00' 
                        }));
                      }}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newSchedule.startTime === '21:00' && newSchedule.endTime === '09:00'
                          ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaMoon className="mr-2" />
                      Night (21:00-9:00)
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {newSchedule.location && newSchedule.location.includes('Visitor Area')
                    ? 'Visitor Area only allows day shift (9:00-18:00)'
                    : newSchedule.location && newSchedule.location.includes('Workshop')
                    ? 'Workshop only allows day shift (8:00-17:00)'
                    : 'Click a button to quickly set shift times, or manually adjust below'
                  }
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => {
                      setNewSchedule(prev => ({ ...prev, startTime: e.target.value }));
                      validateField('startTime', e.target.value);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.startTime}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => {
                      setNewSchedule(prev => ({ ...prev, endTime: e.target.value }));
                      validateField('endTime', e.target.value);
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      validationErrors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.endTime}</p>
                  )}
                </div>
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newSchedule.priority}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Staff Selection */}
              {newSchedule.location && newSchedule.date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Staff ({newSchedule.assignedStaff.length} selected)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    {(() => {
                      if (newSchedule.location.includes('Control Room')) {
                        return 'Only showing Prison Control Room Officer staff who are not scheduled for this date and shift';
                      } else if (newSchedule.location.includes('Medical')) {
                        return 'Only showing Medical department staff who are not scheduled for this date and shift';
                      } else if (newSchedule.location.includes('Admin') || newSchedule.location.includes('Office')) {
                        return 'Only showing Administration department staff who are not scheduled for this date and shift';
                      } else {
                        return 'Only showing Security staff (guards/officers) who are not scheduled for this date and shift';
                      }
                    })()}
                  </p>
                  
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                    {availableStaffForAdd.length > 0 ? (
                      availableStaffForAdd.map((staff) => (
                        <label key={staff._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={newSchedule.assignedStaff.includes(staff._id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setNewSchedule(prev => ({
                                ...prev,
                                assignedStaff: isChecked 
                                  ? [...prev.assignedStaff, staff._id]
                                  : prev.assignedStaff.filter(id => id.toString() !== staff._id.toString())
                              }));
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{staff.name || 'Unknown Name'}</div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No free staff available for this location, date, and shift</p>
                      </div>
                    )}
                  </div>
                  
                  {newSchedule.assignedStaff.length === 0 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <FaExclamationTriangle className="h-4 w-4 text-red-500 mr-2" />
                        <p className="text-sm text-red-700">At least one staff member must be assigned to this schedule</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddSchedule(false);
                  setValidationErrors({}); // Clear validation errors when closing modal
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={newSchedule.assignedStaff.length === 0}
                className={`px-4 py-2 rounded-lg ${
                  newSchedule.assignedStaff.length === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditSchedule && editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Schedule</h3>
            
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Schedule Details</h4>
                <p className="text-sm text-gray-600"><strong>Location:</strong> {editingSchedule.location}</p>
                <p className="text-sm text-gray-600"><strong>Date:</strong> {editingSchedule.date}</p>
                <p className="text-sm text-gray-600"><strong>Shift:</strong> {editingSchedule.shift ? (editingSchedule.shift.charAt(0).toUpperCase() + editingSchedule.shift.slice(1)) : 'Day'} Shift</p>
                <p className="text-sm text-gray-600"><strong>Time:</strong> {editingSchedule.startTime} - {editingSchedule.endTime}</p>
              </div>

              {/* Currently Assigned Staff */}
              {editingSchedule.assignedStaff && editingSchedule.assignedStaff.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currently Assigned Staff ({editingSchedule.assignedStaff.length} assigned)
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {editingSchedule.assignedStaff.map((assignedStaff) => {
                      const staffId = typeof assignedStaff === 'object' ? assignedStaff._id : assignedStaff;
                      const staffName = resolveStaffName(assignedStaff);
                      
                      return (
                        <div key={staffId} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">{staffName}</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingSchedule(prev => {
                                const updatedStaff = prev.assignedStaff.filter(staff => {
                                  const id = typeof staff === 'object' ? staff._id : staff;
                                  return id.toString() !== staffId.toString();
                                });
                                return {
                                  ...prev,
                                  assignedStaff: updatedStaff
                                };
                              });
                              showSuccess('Removed a staff');
                            }}
                            className="flex items-center space-x-1 text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                            title="Remove this staff member"
                          >
                            <FaTrash className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Free Staff ({editingSchedule.assignedStaff?.length || 0} selected)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  {(() => {
                    if (editingSchedule.location.includes('Control Room')) {
                      return 'Only showing Prison Control Room Officer staff who are not scheduled for this date and shift';
                    } else if (editingSchedule.location.includes('Medical')) {
                      return 'Only showing Medical department staff who are not scheduled for this date and shift';
                    } else if (editingSchedule.location.includes('Admin') || editingSchedule.location.includes('Office')) {
                      return 'Only showing Administration department staff who are not scheduled for this date and shift';
                    } else {
                      return 'Only showing Security staff (guards/officers) who are not scheduled for this date and shift';
                    }
                  })()}
                </p>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {availableStaffForEdit.length > 0 ? (
                    <div className="space-y-2">
                      {availableStaffForEdit.map((staff) => (
                        <label key={staff._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={editingSchedule.assignedStaff?.some(assignedStaff => {
                              const assignedId = typeof assignedStaff === 'object' ? assignedStaff._id : assignedStaff;
                              return assignedId.toString() === staff._id.toString();
                            }) || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setEditingSchedule(prev => {
                                const updatedStaff = isChecked 
                                  ? [...(prev.assignedStaff || []), staff._id]
                                  : (prev.assignedStaff || []).filter(assignedStaff => {
                                      const assignedId = typeof assignedStaff === 'object' ? assignedStaff._id : assignedStaff;
                                      return assignedId.toString() !== staff._id.toString();
                                    });
                                return {
                                  ...prev,
                                  assignedStaff: updatedStaff
                                };
                              });
                              if (isChecked) {
                                showSuccess('Staff added');
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{staff.name || 'Unknown Name'}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No free staff available for this location, date, and shift</p>
                  )}
                </div>
              </div>

              {editingSchedule.assignedStaff?.length === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">⚠️ At least one staff member must be assigned to this schedule</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowEditSchedule(false);
                  setEditingSchedule(null);
                  setAvailableStaffForEdit([]);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSchedule}
                disabled={!editingSchedule || editingSchedule.assignedStaff?.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveScheduleMap;
