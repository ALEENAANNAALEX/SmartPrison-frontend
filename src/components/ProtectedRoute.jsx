import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component to prevent authenticated users from accessing auth pages
const AuthRoute = ({ children }) => {
  const { user, loading, refreshUser } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Double-check auth state when component mounts
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData && !user) {
        // If we have localStorage data but no user in context, refresh
        await refreshUser();
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [user, refreshUser]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, redirect to appropriate dashboard based on role
  if (user) {
    const dashboardPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
export { AuthRoute };
