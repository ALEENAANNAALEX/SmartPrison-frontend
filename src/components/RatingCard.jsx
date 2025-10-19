import React from 'react';

const RatingCard = ({ rating }) => {
  const getRatingColor = (score) => {
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 4.0) return 'bg-blue-500';
    if (score >= 3.0) return 'bg-yellow-500';
    if (score >= 2.0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRatingLabel = (score) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 4.0) return 'Very Good';
    if (score >= 3.0) return 'Good';
    if (score >= 2.0) return 'Fair';
    return 'Poor';
  };

  const getGrade = (score) => {
    if (score >= 4.5) return 'A+';
    if (score >= 4.0) return 'A';
    if (score >= 3.5) return 'B+';
    if (score >= 3.0) return 'B';
    if (score >= 2.5) return 'C+';
    if (score >= 2.0) return 'C';
    if (score >= 1.5) return 'D';
    return 'F';
  };

  const CategoryBar = ({ label, value, color }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-800 font-semibold">{value}/5</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Header with Overall Rating */}
      <div className={`${getRatingColor(rating.overallRating)} p-4 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{rating.prisonerId?.name || 'Unknown'}</h3>
            <p className="text-sm opacity-90">{rating.prisonerId?.prisonerNumber || 'N/A'}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{rating.overallRating}</div>
            <div className="text-xs opacity-90">{getRatingLabel(rating.overallRating)}</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm opacity-90 capitalize">{rating.period} Review</span>
          <span className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-semibold">
            Grade: {getGrade(rating.overallRating)}
          </span>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Category Breakdown</h4>
        
        <CategoryBar 
          label="Cooperation" 
          value={rating.cooperation} 
          color="bg-blue-500"
        />
        
        <CategoryBar 
          label="Discipline" 
          value={rating.discipline} 
          color="bg-green-500"
        />
        
        <CategoryBar 
          label="Respect" 
          value={rating.respect} 
          color="bg-purple-500"
        />
        
        <CategoryBar 
          label="Work Ethic" 
          value={rating.workEthic} 
          color="bg-yellow-500"
        />
      </div>

      {/* Notes Section */}
      {rating.notes && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{rating.notes}</p>
          </div>
        </div>
      )}

      {/* Footer with Metadata */}
      <div className="px-4 pb-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{rating.ratedBy?.name || 'Unknown'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{new Date(rating.ratingDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Status Badge */}
      {rating.status && (
        <div className="px-4 pb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            rating.status === 'approved' ? 'bg-green-100 text-green-800' :
            rating.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
            rating.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {rating.status.charAt(0).toUpperCase() + rating.status.slice(1)}
          </span>
        </div>
      )}

      {/* Strengths and Improvements */}
      {(rating.strengths?.length > 0 || rating.areasForImprovement?.length > 0) && (
        <div className="px-4 pb-4 space-y-3">
          {rating.strengths?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-600 mb-1">✓ Strengths</p>
              <div className="space-y-1">
                {rating.strengths.map((strength, index) => (
                  <p key={index} className="text-xs text-gray-700 pl-3">• {strength}</p>
                ))}
              </div>
            </div>
          )}
          
          {rating.areasForImprovement?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-orange-600 mb-1">→ Areas for Improvement</p>
              <div className="space-y-1">
                {rating.areasForImprovement.map((area, index) => (
                  <p key={index} className="text-xs text-gray-700 pl-3">• {area}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {rating.recommendations && (
        <div className="px-4 pb-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">💡 Recommendations</p>
            <p className="text-xs text-blue-900">{rating.recommendations}</p>
          </div>
        </div>
      )}

      {/* Comparison Indicator */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-center space-x-2 text-xs">
          <div className="flex-1 bg-gray-200 h-1 rounded-full">
            <div 
              className={`h-1 rounded-full ${getRatingColor(rating.overallRating)}`}
              style={{ width: `${(rating.overallRating / 5) * 100}%` }}
            />
          </div>
          <span className="text-gray-600 font-medium">{Math.round((rating.overallRating / 5) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

export default RatingCard;
