import React, { useState } from 'react';
import { FaFileText, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import ocrService from '../services/ocrService';

const OCRDemo = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTestOCR = async () => {
    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      // Test the OCR service with sample data
      const sampleText = `
        GOVERNMENT OF INDIA
        AADHAAR CARD
        
        Name: John Michael Doe
        Date of Birth: 15/03/1985
        Gender: Male
        Father's Name: Robert Doe
        Mother's Name: Mary Doe
        Address: 123 Main Street, City, State, 12345
        Aadhaar Number: 1234 5678 9012
      `;

      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract data from sample text
      const extractedData = ocrService.extractDataFromText(sampleText, 'aadhaar');
      const validation = ocrService.validateExtractedData(extractedData);

      setResult({
        extractedData,
        validation,
        originalText: sampleText
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaFileText className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">OCR Feature Demo</h2>
              <p className="text-gray-600">Test the OCR functionality with sample data</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Test Button */}
            <div className="text-center">
              <button
                onClick={handleTestOCR}
                disabled={isProcessing}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaFileText className="w-5 h-5" />
                    Test OCR Processing
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-400 w-5 h-5 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="space-y-6">
                {/* Validation Results */}
                <div className={`p-4 rounded-lg border ${
                  result.validation.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {result.validation.isValid ? (
                      <FaCheckCircle className="text-green-400 w-5 h-5 mr-2" />
                    ) : (
                      <FaExclamationTriangle className="text-yellow-400 w-5 h-5 mr-2" />
                    )}
                    <span className={`font-medium ${
                      result.validation.isValid ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      OCR Processing Complete - Confidence: {result.extractedData.confidence}%
                    </span>
                  </div>
                  
                  {result.validation.errors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                      <ul className="text-sm text-red-700 list-disc list-inside">
                        {result.validation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.validation.warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside">
                        {result.validation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Extracted Data Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Extracted Information</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extracted Value</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">Name</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{result.extractedData.name || 'Not found'}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">Date of Birth</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{result.extractedData.dateOfBirth || 'Not found'}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">Gender</td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">{result.extractedData.gender || 'Not found'}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">Aadhaar Number</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-mono">{result.extractedData.idNumber || 'Not found'}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">Address</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{result.extractedData.address || 'Not found'}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">Father's Name</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{result.extractedData.fatherName || 'Not found'}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">Mother's Name</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{result.extractedData.motherName || 'Not found'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Original Text */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Original OCR Text:</h4>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                    {result.originalText}
                  </pre>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">How to Use OCR in Production:</h4>
              <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                <li>Go to Admin → Prisoner Management → Add New Prisoner</li>
                <li>In the Government ID section, click the "OCR" button</li>
                <li>Select the document type (Aadhaar, Passport, etc.)</li>
                <li>Upload a clear image of the government ID</li>
                <li>Review the extracted data and click "Use Extracted Data"</li>
                <li>Verify and edit any incorrect information</li>
                <li>Complete the prisoner registration process</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRDemo;

