import React, { useState, useEffect } from 'react'; // React core + state/effect hooks
import AdminLayout from '../../components/AdminLayout'; // Shared admin layout wrapper (sidebar, header)
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaArrowLeft, FaFileAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'; // Icons for UI actions
import OCRProcessor from '../../components/OCRProcessor'; // OCR component for document processing
import ocrService from '../../services/ocrService'; // OCR service for document processing

// Section: Component blueprint
// - State: list of prisoners, blocks, UI flags (loading, show modal), editing entity
// - Form state: formData with nested address and emergencyContact, and formErrors
// - Filters: searchTerm, filterBlock, filterSecurity; derived filteredPrisoners
// - Effects: load prisoners and blocks on mount
// - API: fetch lists; create/update/delete prisoner
// - Handlers: submit (validate + send), edit, delete; helper resetForm, showMessage
// - Render: loading gate, action bar with add sample, filters, table, modal form

const AddPrisoners = () => {
  const [prisoners, setPrisoners] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrisoner, setEditingPrisoner] = useState(null);
  const [viewingPrisoner, setViewingPrisoner] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');
  const [filterSecurity, setFilterSecurity] = useState('');
  const [filterCharge, setFilterCharge] = useState('');
  const [mode, setMode] = useState('single');
  const [photoFile, setPhotoFile] = useState(null);
  const [governmentIdFile, setGovernmentIdFile] = useState(null);
  // OCR comparison results for validating typed Full Name and DOB against the uploaded ID
  const [ocrComparison, setOcrComparison] = useState(null);
  const [ocrVerified, setOcrVerified] = useState(false);
  // Emergency contact GovID uploads + OCR status per row
  const [ecGovIdFiles, setEcGovIdFiles] = useState([]); // Array<File|null>
  const [ecOcrStatus, setEcOcrStatus] = useState([]); // 'verified' | 'not_verified' | 'processing' | ''
  const [bulkCsvFile, setBulkCsvFile] = useState(null);
  const [bulkPhotoFiles, setBulkPhotoFiles] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  
  const [bulkResults, setBulkResults] = useState(null);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [isOcrDataApplied, setIsOcrDataApplied] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 'male',
    prisonerNumber: '',
    currentBlock: '',
    securityLevel: 'medium',
    charges: '',
    sentenceLength: '',
    admissionDate: '',
    cellNumber: '',
    address: {
      street: '',
      street2: '',
      city: '',
      state: '',
      pincode: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    emergencyContacts: []
  });
  const [fullName, setFullName] = useState('');

  // Date helpers for real-time validation
  const toInputDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = new Date();
  const maxDobDateObj = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxDobInput = toInputDate(maxDobDateObj); // User must be 18+ on this date

  const sixMonthsBack = new Date(today);
  sixMonthsBack.setMonth(sixMonthsBack.getMonth() - 6);
  const sixMonthsForward = new Date(today);
  sixMonthsForward.setMonth(sixMonthsForward.getMonth() + 6);
  const minAdmissionDateObj = sixMonthsBack;
  const maxAdmissionDateObj = sixMonthsForward;
  const minAdmissionInput = toInputDate(minAdmissionDateObj); // Only allow within last year
  const maxAdmissionInput = toInputDate(maxAdmissionDateObj); // Not in the future

  const calculateAge = (isoDate) => {
    if (!isoDate) return 0;
    const dob = new Date(isoDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const validateDob = (isoDate) => {
    if (!isoDate) return 'Date of birth is required';
    if (calculateAge(isoDate) < 18) return 'User must be at least 18 years old';
    return '';
  };

  const validateAdmissionDate = (isoDate) => {
    if (!isoDate) return 'Admission date is required';
    const d = new Date(isoDate);
    if (d < minAdmissionDateObj || d > maxAdmissionDateObj) {
      return 'Admission date must be within the last 1 year and not in the future';
    }
    return '';
  };

  // Helper: generate prisoner number like P123456
  const generatePrisonerNumber = () => {
    let maxNumber = 0;
    prisoners.forEach(p => {
      const match = String(p.prisonerNumber || '').match(/^P(\d{1,})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!Number.isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    const next = maxNumber + 1;
    return `P${String(next).padStart(3, '0')}`;
  };

  // Helper: compute cell label based on block occupancy (5 inmates per cell) => C01, C02, ...
  const computeAutoCellForBlock = (blockId) => {
    const block = blocks.find(b => b._id === blockId);
    if (!block) return '';
    const cellIndex = Math.floor((block.currentOccupancy || 0) / 5) + 1;
    return `C${String(cellIndex).padStart(3, '0')}`;
  };

  useEffect(() => {
    fetchPrisoners();
    fetchBlocks();
  }, []);

  // Function to show messages
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Function to clear form errors
  const clearFormErrors = () => {
    setFormErrors({});
  };

  const fetchPrisoners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/prisoners', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrisoners(data.prisoners);
        }
      }
    } catch (error) {
      console.error('Error fetching prisoners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/blocks', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBlocks(data.blocks);
        }
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFormErrors();

    if (mode === 'single') {
      const errors = {};
      const nameTrim = fullName.trim();
      if (!nameTrim) {
        errors.fullName = 'Full name is required';
      } else if (!/^[A-Za-z\s'-]+$/.test(nameTrim)) {
        errors.fullName = 'Name can only contain letters, spaces, hyphens, and apostrophes';
      } else if (nameTrim.split(/\s+/).length < 2) {
        errors.fullName = 'Please enter at least first and last name';
      }
      if (!formData.prisonerNumber.trim()) {
        errors.prisonerNumber = 'Prisoner number is required';
      }
      const dobError = validateDob(formData.dateOfBirth);
      if (dobError) {
        errors.dateOfBirth = dobError;
      }
      if (!formData.currentBlock) {
        errors.currentBlock = 'Block assignment is required';
      }
      if (!formData.charges.trim()) {
        errors.charges = 'Charges are required';
      }
      if (formData.emergencyContact?.name) {
        const ec = formData.emergencyContact.name.trim();
        if (ec && !/^[A-Za-z\s'-]+$/.test(ec)) {
          errors.ecName = 'Emergency contact name must contain only letters';
        }
      }
      const admissionError = validateAdmissionDate(formData.admissionDate);
      if (admissionError) {
        errors.admissionDate = admissionError;
      }


      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        showMessage('error', 'Please fix the errors below');
        return;
      }
    }

    try {
      if (mode === 'bulk') {
        if (!bulkCsvFile) {
          showMessage('error', 'Please select a CSV file');
          return;
        }
        setBulkUploading(true);
        setBulkResults(null);

        const fd = new FormData();
        fd.append('csvFile', bulkCsvFile);
        if (bulkPhotoFiles && bulkPhotoFiles.length > 0) {
          Array.from(bulkPhotoFiles).forEach((f) => fd.append('photos', f));
        }

        const bulkResponse = await fetch('http://localhost:5000/api/admin/prisoners/bulk', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
          },
          body: fd
        });

        if (bulkResponse.ok) {
          const result = await bulkResponse.json();
          setBulkResults(result.results || []);
          fetchPrisoners();
          showMessage('success', 'Bulk upload completed');
        } else {
          const err = await bulkResponse.json().catch(() => ({}));
          showMessage('error', 'Bulk upload failed: ' + (err.msg || 'Unknown error'));
        }
        setBulkUploading(false);
        return;
      }

      const isEditing = Boolean(editingPrisoner);
      const url = isEditing
        ? `http://localhost:5000/api/admin/prisoners/${editingPrisoner._id}`
        : 'http://localhost:5000/api/admin/prisoners';

      const method = isEditing ? 'PUT' : 'POST';

      // debug log removed

      let response;
      if (isEditing) {
        // Derive first/last from full name
        const nameParts = fullName.trim().split(/\s+/);
        const derivedFirst = nameParts.shift() || '';
        const derivedLast = nameParts.join(' ') || '';
        // If files present, use multipart FormData; else JSON
        const hasFiles = photoFile || governmentIdFile || ecGovIdFiles.some(file => file !== null);
        if (hasFiles) {
          const fd = new FormData();
          fd.append('firstName', derivedFirst);
          fd.append('lastName', derivedLast);
          fd.append('dateOfBirth', formData.dateOfBirth);
          fd.append('gender', formData.gender);
          fd.append('currentBlock', formData.currentBlock);
          if (formData.cellNumber) fd.append('cellNumber', formData.cellNumber);
          if (formData.admissionDate) fd.append('admissionDate', formData.admissionDate);
          fd.append('securityLevel', formData.securityLevel);
          if (formData.charges) fd.append('charges', formData.charges);
          if (formData.sentenceLength) fd.append('sentenceDetails', JSON.stringify({ sentenceLength: Number(formData.sentenceLength) }));
          if (formData.address) fd.append('address', JSON.stringify(formData.address));
          if (formData.emergencyContact) fd.append('emergencyContact', JSON.stringify(formData.emergencyContact));
          if (Array.isArray(formData.emergencyContacts) && formData.emergencyContacts.length > 0) {
            console.log('🔍 DEBUG: Emergency contacts data being sent:', formData.emergencyContacts);
            fd.append('emergencyContacts', JSON.stringify(formData.emergencyContacts));
          }
          if (photoFile) fd.append('photograph', photoFile);
          if (governmentIdFile) fd.append('governmentId', governmentIdFile);
          
          // Append emergency contact government ID files with indexed field names
          console.log('🔍 DEBUG: Emergency contact government ID files to upload:', ecGovIdFiles);
          ecGovIdFiles.forEach((file, index) => {
            if (file) {
              fd.append(`emergencyContactGovernmentId_${index}`, file);
              console.log(`📁 DEBUG: Added emergency contact file ${index}:`, file.name);
            }
          });
          
          // Debug: Log all FormData entries
          console.log('🔍 DEBUG: FormData entries being sent:');
          for (let pair of fd.entries()) {
            if (pair[0].startsWith('emergencyContactGovernmentId_')) {
              console.log(`📁 DEBUG: FormData - ${pair[0]}:`, pair[1]);
            }
          }
          
          response = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}` },
            body: fd
          });
        } else {
          const payload = {
            ...formData,
            firstName: derivedFirst,
            lastName: derivedLast,
          };
          // Normalize emergency contacts: ensure primary is first
          if (Array.isArray(formData.emergencyContacts) && formData.emergencyContacts.length > 0) {
            const list = [...formData.emergencyContacts];
            const primary = formData.emergencyContact && formData.emergencyContact.name ? formData.emergencyContact : list[0];
            const filtered = list.filter((c, idx) => idx === 0 ? true : !!c);
            if (primary) {
              const withoutPrimary = filtered.filter(c => c !== primary);
              payload.emergencyContacts = [primary, ...withoutPrimary];
              payload.emergencyContact = primary;
            } else {
              payload.emergencyContacts = filtered;
            }
          }
          response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
            },
            body: JSON.stringify(payload)
          });
        }
      } else {
        const fd = new FormData();
        const autoId = formData.prisonerNumber?.trim() || generatePrisonerNumber();
        setFormData(prev => ({ ...prev, prisonerNumber: autoId }));
        fd.append('prisonerNumber', autoId);
        const nameParts = fullName.trim().split(/\s+/);
        const derivedFirst = nameParts.shift() || '';
        const derivedLast = nameParts.join(' ') || '';
        fd.append('firstName', derivedFirst);
        fd.append('lastName', derivedLast);
        fd.append('dateOfBirth', formData.dateOfBirth);
        fd.append('gender', formData.gender);
        fd.append('currentBlock', formData.currentBlock);
        const autoCell = formData.cellNumber?.trim() || computeAutoCellForBlock(formData.currentBlock);
        if (autoCell) {
          setFormData(prev => ({ ...prev, cellNumber: autoCell }));
          fd.append('cellNumber', autoCell);
        }
        if (formData.admissionDate) fd.append('admissionDate', formData.admissionDate);
        fd.append('securityLevel', formData.securityLevel);
        if (formData.charges) fd.append('charges', formData.charges);
        if (formData.sentenceLength) {
          fd.append('sentenceDetails', JSON.stringify({ sentenceLength: Number(formData.sentenceLength) }));
        }
        if (formData.address) {
          const composedAddress = {
            street: formData.address.street?.trim() || '',
            city: '',
            state: '',
            pincode: ''
          };
          fd.append('address', JSON.stringify(composedAddress));
        }
        if (formData.emergencyContact) fd.append('emergencyContact', JSON.stringify(formData.emergencyContact));
        if (Array.isArray(formData.emergencyContacts) && formData.emergencyContacts.length > 0) {
          fd.append('emergencyContacts', JSON.stringify(formData.emergencyContacts));
        }
        if (photoFile) fd.append('photograph', photoFile);
        if (governmentIdFile) fd.append('governmentId', governmentIdFile);
        
        // Append emergency contact government ID files with indexed field names
        console.log('🔍 DEBUG: Emergency contact government ID files to upload (create):', ecGovIdFiles);
        ecGovIdFiles.forEach((file, index) => {
          if (file) {
            fd.append(`emergencyContactGovernmentId_${index}`, file);
            console.log(`📁 DEBUG: Added emergency contact file ${index}:`, file.name);
          }
        });

        response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
          },
          body: fd
        });
      }

      

      if (response.ok) {
        const result = await response.json();
        
        fetchPrisoners();
        setShowAddModal(false);
        setEditingPrisoner(null);
        resetForm();
        showMessage('success', `Prisoner ${editingPrisoner ? 'updated' : 'added'} successfully!`);
        
        // Check if emergency contact files were processed
        const hasEcFiles = ecGovIdFiles.some(file => file !== null);
        if (hasEcFiles) {
          console.log('✅ Emergency contact government ID files were uploaded successfully');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error saving prisoner:', errorData);
        
        // Check if the error is related to emergency contact files
        const hasEcFiles = ecGovIdFiles.some(file => file !== null);
        if (hasEcFiles) {
          showMessage('error', 'Error saving prisoner: Emergency contact government ID files may not have been saved properly. ' + (errorData.message || 'Unknown error'));
        } else {
          showMessage('error', 'Error saving prisoner: ' + (errorData.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error saving prisoner:', error);
      showMessage('error', 'Error saving prisoner: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: 'male',
      prisonerNumber: '',
      currentBlock: '',
      securityLevel: 'medium',
      charges: '',
      sentenceLength: '',
      admissionDate: '',
      cellNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      emergencyContacts: []
    });
    clearFormErrors();
    setOcrData(null);
    setOcrError('');
    setOcrProcessing(false);
    setIsOcrDataApplied(false);
    setEcGovIdFiles([]);
    setEcOcrStatus([]);
  };

  // Handle OCR data extraction
  const handleOCRDataExtracted = (extractedData) => {
    console.log('OCR Data extracted:', extractedData);
    
    // Update form data with extracted information - Only Name and Date of Birth
    if (extractedData.name) {
      setFullName(extractedData.name);
    }
    
    if (extractedData.dateOfBirth) {
      // Ensure the date is in the correct format for the date input (YYYY-MM-DD)
      const formattedDate = extractedData.dateOfBirth.includes('-') ? extractedData.dateOfBirth : 
        extractedData.dateOfBirth.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1');
      setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
    }

    // Store OCR data for reference and mark as applied
    setOcrData(extractedData);
    setIsOcrDataApplied(true);
    setShowOCRModal(false);
    
    showMessage('success', 'Data extracted from document and populated in form. Fields are now read-only.');
  };

  // Handle OCR modal close
  const handleOCRClose = () => {
    setShowOCRModal(false);
  };


  // Handle government ID file upload - separate from OCR
  const handleGovernmentIdUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setOcrError('Please select a valid image or PDF file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setOcrError('File size must be less than 5MB');
      return;
    }

    // Set the file - this is independent of OCR
    setGovernmentIdFile(file);
    setOcrError('');
    setOcrComparison(null);
    setOcrVerified(false);
    
    // Only process with OCR if it's an image file
    if (file.type.startsWith('image/')) {
      setOcrData(null);
      await processOCR(file);
    }
  };

  // Process OCR automatically
  const processOCR = async (file) => {
    setOcrProcessing(true);
    setOcrError('');

    try {
      // Process image with OCR
      const ocrResult = await ocrService.processImage(file);
      
      if (!ocrResult.success) {
        throw new Error(ocrResult.message || 'OCR processing failed');
      }

      // Extract structured data
      const extracted = ocrService.extractDataFromText(ocrResult.text, 'aadhaar');
      setOcrData(extracted);

      // Compare with currently typed fields (do not overwrite yet)
      const comparison = ocrService.compareWithFormData(extracted, {
        fullName,
        dateOfBirth: formData.dateOfBirth,
        emergencyContactName: formData.emergencyContact?.name || ''
      });
      setOcrComparison(comparison);

      // Validate extracted data
      const validation = ocrService.validateExtractedData(extracted);
      
      if (validation.isValid) {
        // If user has not typed values yet, populate from OCR; else just validate
        let populated = false;
        if (!fullName?.trim() && extracted.name) {
          setFullName(extracted.name);
          populated = true;
        }
        if (!formData.dateOfBirth && extracted.dateOfBirth) {
          const formattedDate = extracted.dateOfBirth.includes('-') ? extracted.dateOfBirth :
            extracted.dateOfBirth.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1');
          setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
          populated = true;
        }

        // If OCR suggests a guardian name and EC name is empty, prefill emergency contact
        if (extracted.emergencySuggestion && !(formData.emergencyContact?.name)) {
          const ec = {
            name: extracted.emergencySuggestion.name,
            relationship: extracted.emergencySuggestion.relationship,
            phone: formData.emergencyContact?.phone || ''
          };
          setFormData(prev => ({ ...prev, emergencyContact: ec }));
          populated = true;
        }

        // Only lock fields if we auto-populated them
        setIsOcrDataApplied(populated);

        if (comparison?.mismatches?.length) {
          showMessage('error', `OCR comparison found mismatches: ${comparison.mismatches.join(' | ')}`);
          setOcrVerified(false);
        } else {
          showMessage('success', `OCR verified. ${populated ? 'Fields auto-filled.' : ''}`);
          setOcrVerified(true);
        }
      } else {
        showMessage('error', `OCR completed with warnings. Confidence: ${extracted.confidence}%`);
        if (validation.errors.length > 0) {
          setOcrError(`OCR Errors: ${validation.errors.join(', ')}`);
        }
        setOcrVerified(false);
      }

    } catch (error) {
      console.error('OCR processing error:', error);
      setOcrError(error.message || 'Failed to process image with OCR');
      showMessage('error', 'OCR processing failed: ' + (error.message || 'Unknown error'));
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleEdit = (prisoner) => {
    setEditingPrisoner(prisoner);
    
    console.log('🔍 DEBUG: Prisoner data being loaded for edit:', prisoner);
    console.log('🔍 DEBUG: Prisoner emergency contacts:', prisoner.emergencyContacts);
    console.log('🔍 DEBUG: Prisoner emergency contact:', prisoner.emergencyContact);
    
    // Prepare emergency contacts with existing government ID paths preserved
    const emergencyContacts = Array.isArray(prisoner.emergencyContacts) && prisoner.emergencyContacts.length > 0 
      ? prisoner.emergencyContacts.map(contact => ({
          ...contact,
          // Preserve existing governmentId path
          governmentId: contact.governmentId || ''
        }))
      : (prisoner.emergencyContact && prisoner.emergencyContact.name ? [{
          ...prisoner.emergencyContact,
          governmentId: prisoner.emergencyContact.governmentId || ''
        }] : []);
    
    console.log('🔍 DEBUG: Processed emergency contacts:', emergencyContacts);
    
    // Pre-fill form fields
    setFormData({
      firstName: prisoner.firstName || '',
      lastName: prisoner.lastName || '',
      middleName: prisoner.middleName || '',
      dateOfBirth: prisoner.dateOfBirth ? new Date(prisoner.dateOfBirth).toISOString().split('T')[0] : '',
      gender: prisoner.gender || 'male',
      prisonerNumber: prisoner.prisonerNumber || '',
      currentBlock: prisoner.currentBlock?._id || prisoner.currentBlock || '',
      securityLevel: prisoner.securityLevel || 'medium',
      // Support string or array shape for charges
      charges: typeof prisoner.charges === 'string' ? prisoner.charges : (prisoner.charges?.[0]?.charge || ''),
      sentenceLength: prisoner.sentenceDetails?.sentenceLength || prisoner.sentenceLength || '',
      admissionDate: prisoner.admissionDate ? new Date(prisoner.admissionDate).toISOString().split('T')[0] : '',
      cellNumber: prisoner.cellNumber || '',
      address: {
        street: prisoner.address?.street || '',
        city: prisoner.address?.city || '',
        state: prisoner.address?.state || '',
        pincode: prisoner.address?.pincode || ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      emergencyContacts: emergencyContacts
    });
    // Fill combined name used by the small form
    const combinedName = [prisoner.firstName, prisoner.middleName, prisoner.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    setFullName(combinedName);

    setShowAddModal(true);
    clearFormErrors();
    setMessage({ type: '', text: '' });
    setMode('single');
    setPhotoFile(null);
    // Don't clear governmentIdFile - let it show existing file or new upload
    // Reset OCR state for new prisoner
    setOcrData(null);
    setOcrError('');
    setOcrProcessing(false);
    setIsOcrDataApplied(false);
    
    // Initialize emergency contact government ID files arrays
    const ecCount = emergencyContacts.length;
    setEcGovIdFiles(new Array(ecCount).fill(null));
    setEcOcrStatus(new Array(ecCount).fill(''));
  };

  const openViewDetails = (prisoner) => {
    setViewingPrisoner(prisoner);
  };

  const closeViewDetails = () => {
    setViewingPrisoner(null);
  };

  const handleDelete = async (prisonerId) => {
    if (window.confirm('Are you sure you want to delete this prisoner?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/prisoners/${prisonerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
          }
        });

        if (response.ok) {
          fetchPrisoners();
        }
      } catch (error) {
        console.error('Error deleting prisoner:', error);
      }
    }
  };

  // Filter prisoners based on search and filters
  const filteredPrisoners = prisoners.filter(prisoner => {
    const matchesSearch = searchTerm === '' || 
      prisoner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prisoner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prisoner.prisonerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBlock = filterBlock === '' || prisoner.currentBlock?._id === filterBlock;
    const matchesSecurity = filterSecurity === '' || prisoner.securityLevel === filterSecurity;
    
    // Filter by primary charge (first charge in the charges array)
    const matchesCharge = filterCharge === '' || 
      (prisoner.charges && prisoner.charges.length > 0 && 
       prisoner.charges[0].charge.toLowerCase().includes(filterCharge.toLowerCase()));
    
    return matchesSearch && matchesBlock && matchesSecurity && matchesCharge;
  });

  if (loading) {
    return (
      <AdminLayout title="Prisoner Management" subtitle="Add and manage prisoners">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Prisoner Management" subtitle="Add and manage prisoners">
      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUserShield className="text-2xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Total Prisoners: {prisoners.length}</h3>
              <p className="text-gray-600">Active prisoners in the system</p>
            </div>
          </div>
          {!showAddModal && (
          <div className="flex gap-2">

            <button
              onClick={() => {
                setShowAddModal(true);
                clearFormErrors();
                setMessage({ type: '', text: '' });
                // Reset OCR state for new prisoner
                setOcrData(null);
                setOcrError('');
                setOcrProcessing(false);
                setIsOcrDataApplied(false);
                setFormData(prev => ({
                  ...prev,
                  prisonerNumber: prev.prisonerNumber || generatePrisonerNumber(),
                  admissionDate: prev.admissionDate || toInputDate(today)
                }));
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Add New Prisoner
            </button>
          </div>
          )}
        </div>

        {/* Filters */}
        {!showAddModal && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search prisoners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Blocks</option>
            {blocks.map((block) => (
              <option key={block._id} value={block._id}>{block.name}</option>
            ))}
          </select>
          
          <select
            value={filterSecurity}
            onChange={(e) => setFilterSecurity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Security Levels</option>
            <option value="minimum">Minimum</option>
            <option value="medium">Medium</option>
            <option value="maximum">Maximum</option>
            <option value="supermax">Supermax</option>
          </select>
          
          <select
            value={filterCharge}
            onChange={(e) => setFilterCharge(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Charges</option>
            <option value="theft">Theft</option>
            <option value="fraud">Fraud</option>
            <option value="assault">Assault</option>
            <option value="murder">Murder</option>
            <option value="drug">Drug Related</option>
            <option value="robbery">Robbery</option>
            <option value="burglary">Burglary</option>
            <option value="fraud">Fraud</option>
            <option value="embezzlement">Embezzlement</option>
            <option value="kidnapping">Kidnapping</option>
            <option value="rape">Rape</option>
            <option value="arson">Arson</option>
            <option value="vandalism">Vandalism</option>
            <option value="trespassing">Trespassing</option>
            <option value="forgery">Forgery</option>
            <option value="extortion">Extortion</option>
            <option value="bribery">Bribery</option>
            <option value="perjury">Perjury</option>
            <option value="contempt">Contempt of Court</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredPrisoners.length} of {prisoners.length} prisoners
          </div>
        </div>
        )}
      </div>

      {/* Add/Edit Inline Form (below totals) */}
      {showAddModal && (
        <div className="bg-white rounded-xl p-8 border border-gray-200 mt-6 max-w-2xl mx-auto w-full">
          <div className="w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPrisoner ? 'Edit Prisoner' : 'Add New Prisoner'}
            </h3>
            {/* Bulk upload removed: force Single Add mode */}

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'bulk' && !editingPrisoner ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Bulk Upload Prisoners</h4>
                    <p className="text-sm text-gray-600 mb-4">Upload a CSV file with prisoner details. Optional photos: original filenames must match the CSV column <code>photoFilename</code>.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
                        <input type="file" accept=".csv" onChange={(e) => setBulkCsvFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Photos (optional)</label>
                        <input type="file" accept="image/*" multiple onChange={(e) => setBulkPhotoFiles(e.target.files)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="font-medium">CSV columns:</p>
                      <p>prisonerNumber,firstName,lastName,middleName,dateOfBirth,gender,currentBlock,cellNumber,admissionDate,securityLevel,charges,address,emergencyContact,photoFilename</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => { setShowAddModal(false); resetForm(); setMode('single'); setBulkResults(null); }} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors">Cancel</button>
                    <button type="submit" disabled={bulkUploading} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">{bulkUploading ? 'Uploading...' : 'Start Upload'}</button>
                  </div>
                  {bulkResults && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold mb-2">Results</h5>
                      <p className="text-sm text-gray-700">Success: {bulkResults.filter(r => r.success).length} / {bulkResults.length}</p>
                      {bulkResults.some(r => !r.success) && (
                        <div className="mt-2 max-h-40 overflow-auto text-sm">
                          {bulkResults.filter(r => !r.success).map((r, idx) => (
                            <div key={idx} className="text-red-700">{r.prisonerNumber || 'N/A'}: {r.msg}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
              <>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Tip:</span> Use Auto buttons to generate Prisoner ID and Cell.
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="inline-flex items-center px-3 py-2 rounded-md border text-gray-700">
                    <FaArrowLeft className="mr-1" /> Back to List
                  </button>
                </div>
              </div>
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                      {isOcrDataApplied && ocrData?.name && (
                        <span className="ml-2 text-xs text-green-600 font-normal">(Extracted from document)</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        if (isOcrDataApplied && ocrData?.name) return; // Prevent editing when OCR data is applied
                        const val = e.target.value;
                        setFullName(val);
                        const nameTrim = val.trim();
                        let err = '';
                        if (!nameTrim) err = 'Full name is required';
                        else if (!/^[A-Za-z\s'-]+$/.test(nameTrim)) err = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                        else if (nameTrim.split(/\s+/).length < 2) err = 'Please enter at least first and last name';
                        setFormErrors({...formErrors, fullName: err});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.fullName ? 'border-red-300 bg-red-50' : 
                        isOcrDataApplied && ocrData?.name ? 'border-gray-300 bg-gray-100' : 'border-gray-300'
                      }`}
                      placeholder="e.g., John Michael Doe"
                      readOnly={isOcrDataApplied && ocrData?.name}
                      required
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                      {isOcrDataApplied && ocrData?.dateOfBirth && (
                        <span className="ml-2 text-xs text-green-600 font-normal">(Extracted from document)</span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      max={maxDobInput}
                      onChange={(e) => {
                        if (isOcrDataApplied && ocrData?.dateOfBirth) return; // Prevent editing when OCR data is applied
                        const value = e.target.value;
                        setFormData({...formData, dateOfBirth: value});
                        const err = validateDob(value);
                        setFormErrors({...formErrors, dateOfBirth: err});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.dateOfBirth ? 'border-red-300 bg-red-50' : 
                        isOcrDataApplied && ocrData?.dateOfBirth ? 'border-gray-300 bg-gray-100' : 'border-gray-300'
                      }`}
                      readOnly={isOcrDataApplied && ocrData?.dateOfBirth}
                      required
                    />
                    {formErrors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prisoner Number</label>
                    <input
                      type="text"
                      value={formData.prisonerNumber}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <button type="button" className="mt-2 text-xs text-indigo-600 underline" onClick={() => setFormData({...formData, prisonerNumber: generatePrisonerNumber()})}>Auto-generate ID</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photograph</label>
                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded bg-gray-50">
                      <input
                        id="photoInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      />
                      <div className="text-sm text-gray-700 truncate">
                        {photoFile ? photoFile.name : (editingPrisoner?.photograph ? 'Existing photo' : 'No file selected')}
                      </div>
                      <div className="flex gap-1">
                        {(photoFile || editingPrisoner?.photograph) && (
                          <button
                            type="button"
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                            onClick={() => {
                              const url = photoFile ? URL.createObjectURL(photoFile) : (editingPrisoner?.photograph ? `http://localhost:5000${editingPrisoner.photograph}` : '');
                              if (url) window.open(url, '_blank');
                            }}
                          >
                            View
                          </button>
                        )}
                        <label htmlFor="photoInput" className="px-2 py-1 bg-gray-600 text-white text-xs rounded cursor-pointer">{photoFile ? 'Change' : 'Choose File'}</label>
                        {(photoFile || editingPrisoner?.photograph) && (
                          <button type="button" className="px-2 py-1 bg-red-600 text-white text-xs rounded" onClick={() => setPhotoFile(null)}>Remove</button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Optional. Max 5MB.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Government ID (image/PDF)</label>
                    {/* Compact file row */}
                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded bg-gray-50">
                      <input type="file" accept="image/*,application/pdf" onChange={handleGovernmentIdUpload} className="hidden" id="govIdInput" />
                      <div className="text-sm text-gray-700 truncate">
                        {governmentIdFile ? governmentIdFile.name : 'No file selected'}
                      </div>
                      <div className="flex items-center gap-2">
                        {governmentIdFile && (
                          <button type="button" onClick={() => { const url = URL.createObjectURL(governmentIdFile); window.open(url, '_blank'); }} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">View</button>
                        )}
                        <label htmlFor="govIdInput" className="px-2 py-1 bg-gray-600 text-white text-xs rounded cursor-pointer">{governmentIdFile ? 'Change' : 'Choose File'}</label>
                        {governmentIdFile && (
                          <button type="button" onClick={() => setGovernmentIdFile(null)} className="px-2 py-1 bg-red-600 text-white text-xs rounded">Remove</button>
                        )}
                        {ocrError && (
                          <span className="text-xs text-red-700 ml-2 whitespace-nowrap">{ocrError}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* File Display Section - Always shows if file is uploaded */}
                    {/* no big card; compact row above is enough */}
                    
                    {/* Show existing government ID in edit mode */}
                    {editingPrisoner?.governmentId && !governmentIdFile && (
                      <div className="p-3 border border-gray-300 rounded-lg bg-blue-50 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                              <span className="text-xl">📄</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">Existing Government ID</div>
                              <div className="text-xs text-gray-500">
                                Current file on server
                              </div>
                              <div className="text-xs text-blue-600">
                                ✓ Already uploaded
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <a 
                              href={`http://localhost:5000${editingPrisoner.governmentId}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              View
                            </a>
                            <label className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors cursor-pointer">
                              Replace
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleGovernmentIdUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">Optional. Max 5MB. OCR runs automatically when you upload an image.</p>
                    
                    {/* OCR Processing Status */}
                    {ocrProcessing && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <div className="flex items-center gap-2 text-blue-800">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Processing image with OCR...</span>
                        </div>
                      </div>
                    )}

                    {/* OCR Error Display */}
                    {ocrError && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="flex items-center gap-2 text-red-800">
                          <FaExclamationTriangle className="w-4 h-4" />
                          <span>{ocrError}</span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* OCR Results Section - Better positioned for both add and edit modes */}
                {ocrData && !ocrProcessing && (
                  <div className={`mt-4 p-3 rounded-lg border ${
                    ocrVerified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`flex items-center gap-2 ${
                      ocrVerified ? 'text-green-800' : 'text-red-800'
                    }`}>
                      <FaCheckCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">{ocrVerified ? 'OCR verified' : 'OCR not verified'}</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Prison Assignment */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Prison Assignment</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                    <select
                      value={formData.currentBlock}
                      onChange={(e) => {
                        const value = e.target.value;
                        const autoCell = computeAutoCellForBlock(value);
                        setFormData({...formData, currentBlock: value, cellNumber: formData.cellNumber?.trim() ? formData.cellNumber : autoCell});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Block</option>
                      {blocks.map((block) => (
                        <option key={block._id} value={block._id}>
                          {block.name} ({block.blockCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cell Number</label>
                    <input
                      type="text"
                      value={formData.cellNumber}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                    <button type="button" className="mt-2 text-xs text-indigo-600 underline" onClick={() => setFormData({...formData, cellNumber: computeAutoCellForBlock(formData.currentBlock)})}>Auto-generate Cell</button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Security Level</label>
                    <select
                      value={formData.securityLevel}
                      onChange={(e) => setFormData({...formData, securityLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="minimum">Minimum</option>
                      <option value="medium">Medium</option>
                      <option value="maximum">Maximum</option>
                      <option value="supermax">Supermax</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      min={minAdmissionInput}
                      max={maxAdmissionInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, admissionDate: value});
                        const err = validateAdmissionDate(value);
                        setFormErrors({...formErrors, admissionDate: err});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.admissionDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.admissionDate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.admissionDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Charge</label>
                    <input
                      type="text"
                      value={formData.charges}
                      onChange={(e) => setFormData({...formData, charges: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Theft, Assault, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sentence Length (months)</label>
                    <input
                      type="number"
                      value={formData.sentenceLength}
                      onChange={(e) => setFormData({...formData, sentenceLength: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Address</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={[formData.address.street, formData.address.street2, formData.address.city, formData.address.state, formData.address.pincode].filter(Boolean).join(' ').trim()}
                    onChange={(e) => setFormData({...formData, address: { ...formData.address, street: e.target.value, street2: '', city: '', state: '', pincode: '' }})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Emergency Contacts */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h4>
                <div className="space-y-4">
                  {(formData.emergencyContacts && formData.emergencyContacts.length > 0 ? formData.emergencyContacts : (formData.emergencyContact && formData.emergencyContact.name ? [formData.emergencyContact] : [])).map((contact, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-4 items-end border border-gray-200 rounded-lg p-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={contact.name || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const valid = /^[A-Za-z\s'-]+$/.test(val.trim());
                            setFormErrors({...formErrors, [`ecName_${idx}`]: valid || val.trim()==='' ? '' : 'Emergency contact name must contain only letters'});
                            const list = formData.emergencyContacts && formData.emergencyContacts.length > 0 ? [...formData.emergencyContacts] : (formData.emergencyContact && formData.emergencyContact.name ? [formData.emergencyContact] : []);
                            list[idx] = { ...list[idx], name: val };
                            setFormData({ ...formData, emergencyContacts: list, emergencyContact: list[0] || { name: '', relationship: '', phone: '' } });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            formErrors[`ecName_${idx}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {formErrors[`ecName_${idx}`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`ecName_${idx}`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                        <input
                          type="text"
                          value={contact.relationship || ''}
                          onChange={(e) => {
                            const list = formData.emergencyContacts && formData.emergencyContacts.length > 0 ? [...formData.emergencyContacts] : (formData.emergencyContact && formData.emergencyContact.name ? [formData.emergencyContact] : []);
                            list[idx] = { ...list[idx], relationship: e.target.value };
                            setFormData({ ...formData, emergencyContacts: list, emergencyContact: list[0] || { name: '', relationship: '', phone: '' } });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="e.g., Father, Mother, Spouse"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={contact.phone || ''}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '');
                            const list = formData.emergencyContacts && formData.emergencyContacts.length > 0 ? [...formData.emergencyContacts] : (formData.emergencyContact && formData.emergencyContact.name ? [formData.emergencyContact] : []);
                            list[idx] = { ...list[idx], phone: digits };
                            setFormData({ ...formData, emergencyContacts: list, emergencyContact: list[0] || { name: '', relationship: '', phone: '' } });
                            if (digits && (!/^([6-9])[0-9]{9}$/.test(digits))) {
                              setFormErrors({...formErrors, [`ecPhone_${idx}`]: 'Phone must start with 6,7,8,9 and be 10 digits'});
                            } else {
                              const { [`ecPhone_${idx}`]: _removed, ...rest } = formErrors;
                              setFormErrors(rest);
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            formErrors[`ecPhone_${idx}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {formErrors[`ecPhone_${idx}`] && (
                          <p className="mt-1 text-sm text-red-600">{formErrors[`ecPhone_${idx}`]}</p>
                        )}
                      </div>
                      {/* EC Government ID upload (image/PDF) with OCR verification */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Govt ID (image/PDF)</label>
                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded bg-gray-50">
                          <input
                            id={`ec-gov-${idx}`}
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              setEcGovIdFiles((arr) => { const next = [...arr]; next[idx] = file || null; return next; });
                              if (!file || !file.type.startsWith('image/')) { setEcOcrStatus((s)=>{ const n=[...s]; n[idx]=''; return n;}); return; }
                              setEcOcrStatus((s)=>{ const n=[...s]; n[idx]='processing'; return n;});
                              try {
                                const ocrRes = await ocrService.processImage(file);
                                if (!ocrRes.success) throw new Error('OCR failed');
                                const extracted = ocrService.extractDataFromText(ocrRes.text, 'aadhaar');
                                const ocrName = extracted.name || '';
                                const sim = ocrService.calculateSimilarity(ocrService.cleanName(ocrName).toLowerCase(), ocrService.cleanName((formData.emergencyContacts?.[idx]?.name || '')).toLowerCase());
                                setEcOcrStatus((s)=>{ const n=[...s]; n[idx] = sim > 0.8 ? 'verified' : 'not_verified'; return n;});
                              } catch {
                                setEcOcrStatus((s)=>{ const n=[...s]; n[idx]='not_verified'; return n;});
                              }
                            }}
                          />
                          <div className="text-sm text-gray-700 truncate">
                            {ecGovIdFiles[idx]?.name || (contact.governmentId ? 'File uploaded' : 'No file selected')}
                          </div>
                          <div className="flex gap-1">
                            {(ecGovIdFiles[idx] || contact.governmentId) && (
                              <button type="button" className="px-2 py-1 bg-blue-600 text-white text-xs rounded" onClick={() => { 
                                if (ecGovIdFiles[idx]) {
                                  const url = URL.createObjectURL(ecGovIdFiles[idx]);
                                  window.open(url, '_blank');
                                } else if (contact.governmentId) {
                                  window.open(`http://localhost:5000${contact.governmentId}`, '_blank');
                                }
                              }}>View</button>
                            )}
                            <label htmlFor={`ec-gov-${idx}`} className="px-2 py-1 bg-gray-600 text-white text-xs rounded cursor-pointer">{(ecGovIdFiles[idx] || contact.governmentId) ? 'Change' : 'Choose File'}</label>
                            {(ecGovIdFiles[idx] || contact.governmentId) && (
                              <button type="button" className="px-2 py-1 bg-red-600 text-white text-xs rounded" onClick={() => { 
                                setEcGovIdFiles((a)=>{ const n=[...a]; n[idx]=null; return n;}); 
                                setEcOcrStatus((s)=>{ const n=[...s]; n[idx]=''; return n;}); 
                                // Remove the governmentId from the contact data
                                const updatedContacts = [...formData.emergencyContacts];
                                if (updatedContacts[idx]) {
                                  updatedContacts[idx] = { ...updatedContacts[idx], governmentId: '' };
                                  setFormData(prev => ({ ...prev, emergencyContacts: updatedContacts }));
                                }
                              }}>Remove</button>
                            )}
                          </div>
                        </div>
                        {ecOcrStatus[idx] && (
                          <div className={`mt-1 text-xs ${ecOcrStatus[idx]==='verified' ? 'text-green-700' : ecOcrStatus[idx]==='processing' ? 'text-blue-700' : 'text-red-700'}`}>
                            {ecOcrStatus[idx]==='verified' ? 'OCR verified' : ecOcrStatus[idx]==='processing' ? 'OCR processing…' : 'OCR not verified'}
                          </div>
                        )}
                      </div>
                      {/* Removed text Govt ID field per request */}
                      <div className="col-span-4 flex justify-between">
                        <span className="text-xs text-gray-500">{idx === 0 ? 'Primary contact' : 'Secondary contact'}</span>
                        <div className="flex gap-2">
                          {idx > 0 && (
                            <button type="button" onClick={() => {
                              const list = (formData.emergencyContacts && formData.emergencyContacts.length > 0 ? [...formData.emergencyContacts] : (formData.emergencyContact && formData.emergencyContact.name ? [formData.emergencyContact] : [])).filter((_, i) => i !== idx);
                              setFormData({ ...formData, emergencyContacts: list, emergencyContact: list[0] || { name: '', relationship: '', phone: '' } });
                            }} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded">Remove</button>
                          )}
                          {idx === (formData.emergencyContacts && formData.emergencyContacts.length > 0 ? formData.emergencyContacts.length - 1 : 0) && (
                            <button type="button" onClick={() => {
                              const list = formData.emergencyContacts && formData.emergencyContacts.length > 0 ? [...formData.emergencyContacts] : (formData.emergencyContact && formData.emergencyContact.name ? [formData.emergencyContact] : []);
                              list.push({ name: '', relationship: '', phone: '' });
                              setFormData({ ...formData, emergencyContacts: list });
                            }} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded">Add another</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPrisoner(null);
                    resetForm();
                    setMode('single');
                    setPhotoFile(null);
                    setGovernmentIdFile(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editingPrisoner ? 'Update' : 'Create'} Prisoner
                </button>
              </div>
              </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {message.type === 'success' ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message.text}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  message.type === 'success'
                    ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prisoners Table */}
      {!showAddModal && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prisoner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prisoner #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cell</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Security Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrisoners.map((prisoner) => (
                <tr key={prisoner._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {prisoner.photograph ? (
                        <img src={`http://localhost:5000${prisoner.photograph}`} alt="Photo" className="w-10 h-10 rounded-full object-cover border" onError={(e)=>{ e.currentTarget.style.display='none'; }} />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUserShield className="text-blue-600" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {prisoner.firstName} {prisoner.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prisoner.gender} • {new Date().getFullYear() - new Date(prisoner.dateOfBirth).getFullYear()} years
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {prisoner.prisonerNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prisoner.currentBlock?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prisoner.cellNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prisoner.securityLevel === 'maximum' ? 'bg-red-100 text-red-800' :
                      prisoner.securityLevel === 'medium' ? 'bg-orange-100 text-orange-800' :
                      prisoner.securityLevel === 'supermax' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {prisoner.securityLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(prisoner.admissionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      prisoner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {prisoner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewDetails(prisoner)}
                        className="bg-teal-600 text-white px-3 py-1 rounded text-xs hover:bg-teal-700 transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(prisoner)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(prisoner._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="hidden">
          <div className="w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingPrisoner ? 'Edit Prisoner' : 'Add New Prisoner'}
            </h3>
            {/* Bulk upload removed: force Single Add mode */}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Tip:</span> Use Auto buttons to generate Prisoner ID and Cell.
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="inline-flex items-center px-3 py-2 rounded-md border text-gray-700">
                    <FaArrowLeft className="mr-1" /> Back to List
                  </button>
                </div>
              </div>
              {mode === 'bulk' && !editingPrisoner ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Bulk Upload Prisoners</h4>
                    <p className="text-sm text-gray-600 mb-4">Upload a CSV file with prisoner details. Optional photos: original filenames must match the CSV column <code>photoFilename</code>.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
                        <input type="file" accept=".csv" onChange={(e) => setBulkCsvFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Photos (optional)</label>
                        <input type="file" accept="image/*" multiple onChange={(e) => setBulkPhotoFiles(e.target.files)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p className="font-medium">CSV columns:</p>
                      <p>prisonerNumber,firstName,lastName,middleName,dateOfBirth,gender,currentBlock,cellNumber,admissionDate,securityLevel,charges,address,emergencyContact,photoFilename</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => { setShowAddModal(false); resetForm(); setMode('single'); setBulkResults(null); }} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors">Cancel</button>
                    <button type="submit" disabled={bulkUploading} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">{bulkUploading ? 'Uploading...' : 'Start Upload'}</button>
                  </div>
                  {bulkResults && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold mb-2">Results</h5>
                      <p className="text-sm text-gray-700">Success: {bulkResults.filter(r => r.success).length} / {bulkResults.length}</p>
                      {bulkResults.some(r => !r.success) && (
                        <div className="mt-2 max-h-40 overflow-auto text-sm">
                          {bulkResults.filter(r => !r.success).map((r, idx) => (
                            <div key={idx} className="text-red-700">{r.prisonerNumber || 'N/A'}: {r.msg}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
              <>
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFullName(val);
                        const nameTrim = val.trim();
                        let err = '';
                        if (!nameTrim) err = 'Full name is required';
                        else if (!/^[A-Za-z\s'-]+$/.test(nameTrim)) err = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                        else if (nameTrim.split(/\s+/).length < 2) err = 'Please enter at least first and last name';
                        setFormErrors({...formErrors, fullName: err});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g., John Michael Doe"
                      required
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      max={maxDobInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, dateOfBirth: value});
                        const err = validateDob(value);
                        setFormErrors({...formErrors, dateOfBirth: err});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prisoner Number</label>
                    <input
                      type="text"
                      value={formData.prisonerNumber}
                      onChange={(e) => setFormData({...formData, prisonerNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <button type="button" className="mt-2 text-xs text-indigo-600 underline" onClick={() => setFormData({...formData, prisonerNumber: generatePrisonerNumber()})}>Auto-generate ID</button>
                  </div>
                </div>
                {!editingPrisoner && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Photograph</label>
                      <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                      <p className="text-xs text-gray-500 mt-1">Optional. Max 5MB.</p>
                      {(photoFile || editingPrisoner?.photograph) && (
                        <div className="mt-2">
                          <img
                            src={photoFile ? URL.createObjectURL(photoFile) : (`http://localhost:5000${editingPrisoner?.photograph}`)}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded-md border"
                            onError={(e)=>{ e.currentTarget.style.display='none'; }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Government ID</label>
                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          accept="image/*,application/pdf" 
                          onChange={handleGovernmentIdUpload}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowOCRModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          title="Manual OCR processing"
                        >
                          <FaFileAlt className="w-4 h-4" />
                          Manual OCR
                        </button>
                      </div>
                      {governmentIdFile && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ File selected: {governmentIdFile.name}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Optional. OCR runs automatically when you upload an image.</p>
                      
                      {/* OCR Processing Status */}
                      {ocrProcessing && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <div className="flex items-center gap-2 text-blue-800">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Processing image with OCR...</span>
                          </div>
                        </div>
                      )}

                      {/* OCR Error Display */}
                      {ocrError && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <div className="flex items-center gap-2 text-red-800">
                            <FaExclamationTriangle className="w-4 h-4" />
                            <span>{ocrError}</span>
                          </div>
                        </div>
                      )}

                      {/* OCR Success Display */}
                      {ocrData && !ocrProcessing && (
                        <div className={`mt-2 p-2 rounded text-sm border ${
                          ocrVerified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className={`flex items-center gap-2 ${
                            ocrVerified ? 'text-green-800' : 'text-red-800'
                          }`}>
                            <FaCheckCircle className="w-4 h-4" />
                            <span>{ocrVerified ? 'OCR verified' : 'OCR not verified'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Prison Assignment */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Prison Assignment</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                    <select
                      value={formData.currentBlock}
                      onChange={(e) => {
                        const value = e.target.value;
                        const autoCell = computeAutoCellForBlock(value);
                        setFormData({...formData, currentBlock: value, cellNumber: formData.cellNumber?.trim() ? formData.cellNumber : autoCell});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Block</option>
                      {blocks.map((block) => (
                        <option key={block._id} value={block._id}>
                          {block.name} ({block.blockCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cell Number</label>
                    <input
                      type="text"
                      value={formData.cellNumber}
                      onChange={(e) => setFormData({...formData, cellNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button type="button" className="mt-2 text-xs text-indigo-600 underline" onClick={() => setFormData({...formData, cellNumber: computeAutoCellForBlock(formData.currentBlock)})}>Auto-generate Cell</button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Security Level</label>
                    <select
                      value={formData.securityLevel}
                      onChange={(e) => setFormData({...formData, securityLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="minimum">Minimum</option>
                      <option value="medium">Medium</option>
                      <option value="maximum">Maximum</option>
                      <option value="supermax">Supermax</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      min={minAdmissionInput}
                      max={maxAdmissionInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({...formData, admissionDate: value});
                        const err = validateAdmissionDate(value);
                        setFormErrors({...formErrors, admissionDate: err});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        formErrors.admissionDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.admissionDate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.admissionDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Charge</label>
                    <input
                      type="text"
                      value={formData.charges}
                      onChange={(e) => setFormData({...formData, charges: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Theft, Assault, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sentence Length (months)</label>
                    <input
                      type="number"
                      value={formData.sentenceLength}
                      onChange={(e) => setFormData({...formData, sentenceLength: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Address</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={[formData.address.street, formData.address.city, formData.address.state, formData.address.pincode].filter(Boolean).join(' ').trim()}
                    onChange={(e) => setFormData({...formData, address: { ...formData.address, street: e.target.value, street2: '', city: '', state: '', pincode: '' }})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPrisoner(null);
                    resetForm();
                    setMode('single');
                    setPhotoFile(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {editingPrisoner ? 'Update' : 'Create'} Prisoner
                </button>
              </div>
              </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* View Prisoner Details Modal */}
      {viewingPrisoner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Prisoner Details</h3>
              <button
                onClick={closeViewDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaUserShield className="mr-2 text-red-600" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900">{`${viewingPrisoner.firstName || ''} ${viewingPrisoner.middleName || ''} ${viewingPrisoner.lastName || ''}`.trim()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prisoner Number</label>
                    <p className="text-gray-900">{viewingPrisoner.prisonerNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <p className="text-gray-900">{viewingPrisoner.dateOfBirth ? new Date(viewingPrisoner.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <p className="text-gray-900 capitalize">{viewingPrisoner.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Incarceration Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaFileAlt className="mr-2 text-blue-600" />
                  Incarceration Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Block</label>
                    <p className="text-gray-900">{viewingPrisoner.currentBlock?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cell Number</label>
                    <p className="text-gray-900">{viewingPrisoner.cellNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Level</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      viewingPrisoner.securityLevel === 'high' ? 'bg-red-100 text-red-800' :
                      viewingPrisoner.securityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {viewingPrisoner.securityLevel ? viewingPrisoner.securityLevel.charAt(0).toUpperCase() + viewingPrisoner.securityLevel.slice(1) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                    <p className="text-gray-900">{viewingPrisoner.admissionDate ? new Date(viewingPrisoner.admissionDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaExclamationTriangle className="mr-2 text-orange-600" />
                  Legal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Charges</label>
                    <p className="text-gray-900">
                      {viewingPrisoner.charges ? (
                        typeof viewingPrisoner.charges === 'string' ? 
                          viewingPrisoner.charges : 
                          (Array.isArray(viewingPrisoner.charges) ? 
                            viewingPrisoner.charges.map(chargeObj => chargeObj.charge).join(', ') :
                            viewingPrisoner.charges.charge)
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sentence Length</label>
                    <p className="text-gray-900">{viewingPrisoner.sentenceLength || viewingPrisoner.sentenceDetails?.sentenceLength || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaCheckCircle className="mr-2 text-green-600" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-gray-900">
                      {viewingPrisoner.address ? 
                        `${viewingPrisoner.address.street || ''}, ${viewingPrisoner.address.city || ''}, ${viewingPrisoner.address.state || ''} ${viewingPrisoner.address.zipCode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') 
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <p className="text-gray-900">{viewingPrisoner.emergencyContact?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <p className="text-gray-900">{viewingPrisoner.emergencyContact?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaCheckCircle className="mr-2 text-indigo-600" />
                  Status Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      viewingPrisoner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewingPrisoner.status ? viewingPrisoner.status.charAt(0).toUpperCase() + viewingPrisoner.status.slice(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeViewDetails}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OCR Modal */}
      {showOCRModal && (
        <OCRProcessor
          onDataExtracted={handleOCRDataExtracted}
          onClose={handleOCRClose}
          formData={{
            fullName: fullName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address.street
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AddPrisoners;

// File purpose: Admin page to add, edit, delete, and search prisoners with filtering and validation.
// Frontend location: Route /admin/prisoners (Admin > Prisoner Management) via App.jsx routing.
// Backend endpoints used: GET/POST/PUT/DELETE http://localhost:5000/api/admin/prisoners; GET http://localhost:5000/api/admin/blocks.
// Auth: Expects Bearer token from sessionStorage/localStorage.
// UI container: Wrapped by AdminLayout; uses FontAwesome icons and Tailwind CSS classes.
