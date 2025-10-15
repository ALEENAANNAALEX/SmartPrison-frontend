import React, { useState, useRef } from 'react';
import { FaUpload, FaEye, FaCheck, FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa';
import ocrService from '../services/ocrService';

const OCRProcessor = ({ onDataExtracted, onClose, formData = {} }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [validation, setValidation] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [selectedIdType, setSelectedIdType] = useState('aadhaar');
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setImagePreview(URL.createObjectURL(file));
    processImage(file);
  };

  const processImage = async (file) => {
    setIsProcessing(true);
    setError('');
    setExtractedData(null);
    setValidation(null);
    setComparison(null);

    try {
      // Process image with OCR
      const ocrResult = await ocrService.processImage(file);
      
      if (!ocrResult.success) {
        throw new Error(ocrResult.message || 'OCR processing failed');
      }

      // Extract structured data
      const extracted = ocrService.extractDataFromText(ocrResult.text, selectedIdType);
      setExtractedData(extracted);

      // Validate extracted data
      const validationResult = ocrService.validateExtractedData(extracted);
      setValidation(validationResult);

      // Compare with form data if available
      if (Object.keys(formData).length > 0) {
        const comparisonResult = ocrService.compareWithFormData(extracted, formData);
        setComparison(comparisonResult);
      }

    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseExtractedData = () => {
    if (extractedData && onDataExtracted) {
      onDataExtracted(extractedData);
    }
  };

  const handleRetry = () => {
    setExtractedData(null);
    setValidation(null);
    setComparison(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImagePreview(null);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">OCR Document Processing</h2>
              <p className="text-gray-600">Upload a government ID to automatically extract prisoner information</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>

          {/* ID Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <div className="flex gap-4">
              {[
                { value: 'aadhaar', label: 'Aadhaar Card' },
                { value: 'passport', label: 'Passport' },
                { value: 'voter', label: 'Voter ID' },
                { value: 'driving', label: 'Driving License' }
              ].map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    value={type.value}
                    checked={selectedIdType === type.value}
                    onChange={(e) => setSelectedIdType(e.target.value)}
                    className="mr-2"
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                <FaUpload className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Select Image'}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: JPG, PNG, PDF • Max size: 5MB
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-400 w-5 h-5 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <FaSpinner className="animate-spin text-blue-400 w-5 h-5 mr-2" />
                <p className="text-blue-800">Processing image with OCR...</p>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Preview</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <img
                  src={imagePreview}
                  alt="Document preview"
                  className="max-w-full h-auto max-h-64 mx-auto rounded"
                />
              </div>
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedData && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Information</h3>
              
              {/* Validation Results */}
              {validation && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  validation.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {validation.isValid ? (
                      <FaCheck className="text-green-400 w-5 h-5 mr-2" />
                    ) : (
                      <FaExclamationTriangle className="text-yellow-400 w-5 h-5 mr-2" />
                    )}
                    <span className={`font-medium ${
                      validation.isValid ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      Confidence: {validation.confidence}%
                    </span>
                  </div>
                  
                  {validation.errors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {validation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {validation.warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {validation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Data Comparison */}
              {comparison && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Data Comparison</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Match: {comparison.matchPercentage.toFixed(1)}%
                  </p>
                  
                  {comparison.matches.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-green-800 mb-1">Matches:</p>
                      <ul className="text-sm text-green-700 list-disc list-inside">
                        {comparison.matches.map((match, index) => (
                          <li key={index}>{match}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {comparison.mismatches.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">Mismatches:</p>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {comparison.mismatches.map((mismatch, index) => (
                          <li key={index}>{mismatch}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Data Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Extracted Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {extractedData.name && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Name</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{extractedData.name}</td>
                      </tr>
                    )}
                    {extractedData.dateOfBirth && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Date of Birth</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{extractedData.dateOfBirth}</td>
                      </tr>
                    )}
                    {extractedData.gender && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Gender</td>
                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">{extractedData.gender}</td>
                      </tr>
                    )}
                    {extractedData.idNumber && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">ID Number</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">{extractedData.idNumber}</td>
                      </tr>
                    )}
                    {extractedData.address && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Address</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{extractedData.address}</td>
                      </tr>
                    )}
                    {extractedData.fatherName && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Father's Name</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{extractedData.fatherName}</td>
                      </tr>
                    )}
                    {extractedData.motherName && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">Mother's Name</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{extractedData.motherName}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retry
            </button>
            {extractedData && (
              <button
                onClick={handleUseExtractedData}
                disabled={!validation?.isValid}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaCheck className="w-4 h-4" />
                Use Extracted Data
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRProcessor;

