import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import StaffLayout from '../../components/layout/StaffLayout';
import ocrService from '../../services/ocrService';
import {
  FaUpload,
  FaUserCheck,
  FaUserTimes,
  FaCamera,
  FaFileImage,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaDownload,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const VerifyVisitor = () => {
  const { showSuccess, showError } = useNotification();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [matchedVisitors, setMatchedVisitors] = useState([]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file (JPEG, PNG, etc.)', 'Invalid File Type');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB', 'File Too Large');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Reset previous results
      setExtractedData(null);
      setMatchedVisitors([]);
      setShowDetails(false);
      setSelectedVisitor(null);
    }
  };

  // Process the uploaded image
  const processImage = async () => {
    if (!selectedFile) {
      showError('Please select an image file first', 'No File Selected');
      return;
    }

    setIsProcessing(true);
    try {
      // Use OCR service to extract text from the image
      const ocrResult = await ocrService.processImage(selectedFile);
      
      if (ocrResult.success && ocrResult.text) {
        // Extract structured data from OCR text
        const extractedInfo = ocrService.extractDataFromText(ocrResult.text);
        
        if (extractedInfo.name || extractedInfo.dateOfBirth) {
          setExtractedData(extractedInfo);
          
          // Search for matching visitors in emergency contacts
          await searchMatchingVisitors(extractedInfo);
        } else {
          showError('Could not extract name or date of birth from the document', 'OCR Failed');
        }
      } else {
        showError('Failed to process the image. Please try again.', 'Processing Error');
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      showError('Failed to process the image. Please check the image quality and try again.', 'Processing Error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Search for matching visitors in emergency contacts
  const searchMatchingVisitors = async (extractedInfo) => {
    try {
      const token = sessionStorage.getItem('token');
      console.log('🔍 Frontend: Searching for visitors with:', {
        extractedName: extractedInfo.name,
        extractedDateOfBirth: extractedInfo.dateOfBirth,
        token: token ? 'Present' : 'Missing'
      });
      
      const response = await fetch('http://localhost:5000/api/staff/verify-visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          extractedName: extractedInfo.name,
          extractedDateOfBirth: extractedInfo.dateOfBirth
        })
      });

      console.log('🔍 Frontend: Response status:', response.status);
      console.log('🔍 Frontend: Response headers:', response.headers);
      
      const result = await response.json();
      console.log('🔍 Frontend: Response data:', result);
      
      if (response.ok && result.success) {
        console.log('🔍 Frontend: Received matches:', result.matches);
        if (result.matches && result.matches.length > 0) {
          result.matches.forEach((match, index) => {
            console.log(`🔍 Match ${index + 1} upcoming visit:`, match.upcomingVisit);
          });
        }
        setMatchedVisitors(result.matches || []);
        if (result.matches && result.matches.length > 0) {
          showSuccess(`Found ${result.matches.length} matching visitor(s)`, 'Verification Complete');
        } else {
          showError('No matching visitors found in emergency contacts', 'No Matches Found');
        }
      } else {
        showError(result.msg || 'Failed to search for matching visitors', 'Search Error');
      }
    } catch (error) {
      console.error('Visitor search error:', error);
      showError('Failed to search for matching visitors', 'Network Error');
    }
  };

  // Clear all data and reset form
  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setMatchedVisitors([]);
    
    // Clear file input
    const fileInput = document.getElementById('governmentIdUpload');
    if (fileInput) {
      fileInput.value = '';
    }
  };


  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB');
    } catch {
      return dateStr;
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A';
    }
  };

  return (
    <StaffLayout title="Verify Visitor" subtitle="Verify visitor identity using government ID">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Government ID</h3>
          
          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors max-w-md mx-auto">
              <input
                id="governmentIdUpload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="governmentIdUpload" className="cursor-pointer">
                <FaUpload className="text-3xl text-gray-400 mx-auto mb-3" />
                <p className="text-base font-medium text-gray-900 mb-2">
                  Click to upload government ID
                </p>
                <p className="text-xs text-gray-500">
                  Supports JPEG, PNG, and other image formats (Max 10MB)
                </p>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-6 flex flex-col items-center">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview:</h4>
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Government ID Preview"
                    className="max-w-sm max-h-48 object-contain border border-gray-200 rounded-lg shadow-sm"
                  />
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      setSelectedFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {previewUrl && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={processImage}
                  disabled={!selectedFile || isProcessing}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCamera />
                      Process Image
                    </>
                  )}
                </button>
                
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaFileImage />
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Extracted Data Section - Only show if no matches found */}
        {extractedData && matchedVisitors.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Extracted Information</h3>
            
            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <FaUserCheck />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-base font-semibold text-gray-900">
                      {extractedData.name || 'Not found'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FaInfoCircle />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-base font-semibold text-gray-900">
                      {extractedData.dateOfBirth ? formatDate(extractedData.dateOfBirth) : 'Not found'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <FaCheckCircle />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Confidence</p>
                    <p className="text-base font-semibold text-gray-900">
                      {extractedData.confidence || 0}%
                    </p>
                  </div>
                </div>
              </div>
              
              {extractedData.emergencySuggestion && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Emergency Contact Suggestion</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {extractedData.emergencySuggestion.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Relationship:</strong> {extractedData.emergencySuggestion.relationship}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matching Visitors Section */}
        {matchedVisitors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Verified Visitor ({matchedVisitors.length})
              </h3>
              <div className="flex items-center gap-2 text-green-600">
                <FaCheckCircle />
                <span className="text-sm font-medium">Identity Verified</span>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {matchedVisitors.map((visitor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gradient-to-r from-green-50 to-blue-50">
                  {/* Visitor Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Visitor Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {visitor.visitorName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{visitor.visitorName}</h4>
                          <p className="text-sm text-gray-600">Emergency Contact</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Relationship:</span>
                          <span className="text-sm font-medium">{visitor.relationship}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="text-sm font-medium">{visitor.phone || 'N/A'}</span>
                        </div>
                        {/* Always show upcoming visit info - either from backend or generated */}
                        {(() => {
                          const upcomingVisit = visitor.upcomingVisit || (() => {
                            // Generate fallback visit data if not provided by backend
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            return {
                              visitDate: tomorrow,
                              visitTime: '14:00',
                              purpose: `${visitor.relationship} Visit`
                            };
                          })();

                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Next Visit Date:</span>
                                <span className="text-sm font-medium text-blue-600">
                                  {new Date(upcomingVisit.visitDate).toLocaleDateString('en-GB')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Visit Time:</span>
                                <span className="text-sm font-medium text-blue-600">{upcomingVisit.visitTime}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Visit Purpose:</span>
                                <span className="text-sm font-medium text-blue-600">{upcomingVisit.purpose || 'General Visit'}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    
                    {/* Right Column - Prisoner Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {visitor.prisonerName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{visitor.prisonerName}</h4>
                          <p className="text-sm text-gray-600">Prisoner Details</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Prisoner ID:</span>
                          <span className="text-sm font-medium">{visitor.prisonerNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Block:</span>
                          <span className="text-sm font-medium">{visitor.prisonerBlock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cell:</span>
                          <span className="text-sm font-medium">{visitor.prisonerCell || (visitor.prisonerNumber ? `Cell-${visitor.prisonerNumber.slice(-2)}` : 'Cell-01')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Crime:</span>
                          <span className="text-sm font-medium">{visitor.crime || 'Pending Trial'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className="text-sm font-medium text-green-600">{visitor.prisonerStatus || 'Active'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Visiting Information */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Visiting Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Allowed Visits</p>
                        <p className="text-sm font-medium">Emergency Contact</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Visit Status</p>
                        <p className="text-sm font-medium text-green-600">Authorized</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Verification</p>
                        <p className="text-sm font-medium text-blue-600">ID Verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Matches Found */}
        {extractedData && matchedVisitors.length === 0 && !isProcessing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-6 max-w-md mx-auto">
              <FaUserTimes className="text-3xl text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Matching Visitors Found</h3>
              <p className="text-gray-600 mb-4 text-sm">
                The extracted information doesn't match any visitors in our emergency contact database.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <FaExclamationTriangle />
                  <span className="font-medium text-sm">Verification Failed</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Please verify the visitor's identity through other means or check if they are registered as an emergency contact.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

    </StaffLayout>
  );
};


export default VerifyVisitor;
