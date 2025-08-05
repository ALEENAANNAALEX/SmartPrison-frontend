import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const SessionTimeoutWarning = ({ isVisible, timeLeft, onExtendSession, onLogout }) => {
  const [countdown, setCountdown] = useState(timeLeft);

  useEffect(() => {
    setCountdown(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onLogout]);

  if (!isVisible) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Session Timeout Warning
            </h3>
            <p className="text-sm text-gray-500">
              Your session will expire soon for security reasons
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-red-600">
            <Clock className="h-6 w-6" />
            <span>
              {minutes.toString().padStart(2, '0')}:
              {seconds.toString().padStart(2, '0')}
            </span>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Time remaining before automatic logout
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onExtendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Stay Logged In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            Logout Now
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          This helps protect your account if you forget to logout
        </p>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
