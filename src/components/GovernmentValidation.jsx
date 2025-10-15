import React, { useState } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

const GovernmentValidation = ({ 
  prisonerData, 
  onValidationComplete, 
  onOverride, 
  isVisible, 
  onToggle 
}) => {
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!governmentIdNumber.trim()) {
      setError('Please enter a government ID number');
      return;
    }

    setIsValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/government-validation/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        },
        body: JSON.stringify({
          prisonerData,
          governmentIdNumber: governmentIdNumber.trim()
        })
      });

      const result = await response.json();

      if (result.success) {
        setValidationResult(result);
        onValidationComplete(result);
      } else {
        setError(result.message || 'Validation failed');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate against government records');
    } finally {
      setIsValidating(false);
    }
  };

  const handleOverride = async () => {
    if (!overrideReason.trim()) {
      setError('Please provide a reason for override');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/government-validation/override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token') || 'mock-token'}`
        },
        body: JSON.stringify({
          prisonerId: prisonerData.prisonerNumber,
          overrideReason: overrideReason.trim(),
          discrepancies: validationResult?.discrepancies || []
        })
      });

      const result = await response.json();

      if (result.success) {
        setValidationResult(prev => ({
          ...prev,
          validationStatus: 'override_approved',
          overrideReason: overrideReason.trim()
        }));
        onOverride(result);
        setShowOverrideForm(false);
        setOverrideReason('');
      } else {
        setError(result.message || 'Override failed');
      }
    } catch (err) {
      console.error('Override error:', err);
      setError('Failed to process override request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <FaCheckCircle className="text-green-500" />;
      case 'discrepancies_found':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'override_approved':
        return <FaCheckCircle className="text-blue-500" />;
      case 'not_found':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'discrepancies_found':
        return 'text-yellow-600 bg-yellow-100';
      case 'override_approved':
        return 'text-blue-600 bg-blue-100';
      case 'not_found':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minor':
        return 'text-yellow-600 bg-yellow-100';
      case 'major':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isVisible) {
    return (
      <div className="mt-4">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaEye className="w-4 h-4" />
          Validate Against Government Records
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">Government Validation</h4>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaEyeSlash className="w-4 h-4" />
        </button>
      </div>

      {/* Government ID Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Government ID Number (Aadhaar/Voter ID)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={governmentIdNumber}
            onChange={(e) => setGovernmentIdNumber(e.target.value)}
            placeholder="Enter 12-digit Aadhaar number or Voter ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={12}
          />
          <button
            onClick={handleValidate}
            disabled={isValidating || !governmentIdNumber.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isValidating ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              'Validate'
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            {getStatusIcon(validationResult.validationStatus)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(validationResult.validationStatus)}`}>
              {validationResult.validationStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Discrepancies */}
          {validationResult.discrepancies && validationResult.discrepancies.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Discrepancies Found:</h5>
              <div className="space-y-2">
                {validationResult.discrepancies.map((discrepancy, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {discrepancy.field.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(discrepancy.severity)}`}>
                        {discrepancy.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Provided:</span>
                        <p className="font-medium text-gray-900">{discrepancy.providedValue}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Government Record:</span>
                        <p className="font-medium text-gray-900">{discrepancy.governmentValue}</p>
                      </div>
                    </div>
                    {discrepancy.notes && (
                      <p className="text-xs text-gray-600 mt-2">{discrepancy.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Override Section */}
          {validationResult.validationStatus === 'discrepancies_found' && !showOverrideForm && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-3">
                Discrepancies found between provided data and government records. 
                You can proceed with override if you have verified the information manually.
              </p>
              <button
                onClick={() => setShowOverrideForm(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Override and Proceed
              </button>
            </div>
          )}

          {/* Override Form */}
          {showOverrideForm && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Override Discrepancies</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Override
                  </label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Explain why you're overriding the discrepancies..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleOverride}
                    disabled={!overrideReason.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Approve Override
                  </button>
                  <button
                    onClick={() => {
                      setShowOverrideForm(false);
                      setOverrideReason('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {validationResult.validationStatus === 'verified' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ All data matches government records. No discrepancies found.
              </p>
            </div>
          )}

          {/* Override Approved Message */}
          {validationResult.validationStatus === 'override_approved' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✅ Override approved. You can proceed with adding the prisoner.
              </p>
              {validationResult.overrideReason && (
                <p className="text-xs text-blue-600 mt-1">
                  Reason: {validationResult.overrideReason}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GovernmentValidation;
