import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const SecurityIndicator = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [securityLevel, setSecurityLevel] = useState('high');

  useEffect(() => {
    // Auto-hide after 5 seconds, then show minimized version
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Don't show if user is not logged in
  if (!user) return null;

  return (
    <>
      {/* Full Security Indicator */}
      {isVisible && (
        <div className="fixed top-4 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
          <FaShieldAlt className="h-4 w-4" />
          <span className="text-sm font-medium">Secure Session Active</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-xs">Navigation Protected</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 text-green-200 hover:text-white"
          >
            <FaEyeSlash className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Minimized Security Indicator */}
      {!isVisible && (
        <div 
          className="fixed top-4 left-4 z-50 bg-green-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-green-700 transition-colors"
          onClick={() => setIsVisible(true)}
          title="Security Status: Navigation Protected"
        >
          <FaLock className="h-4 w-4" />
        </div>
      )}

      {/* Security Status Tooltip */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default SecurityIndicator;
