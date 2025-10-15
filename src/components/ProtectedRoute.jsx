import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  // Check role-based access
  if (requiredRole) {
    if (user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user's actual role
      let redirectPath = '/dashboard';
      if (user.role === 'admin') {
        redirectPath = '/admin';
      } else if (user.role === 'warden') {
        redirectPath = '/warden/dashboard';
      } else if (user.role === 'staff') {
        redirectPath = '/staff/dashboard';
      }
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Check route-based role requirements
  const currentPath = location.pathname;
  if (currentPath.startsWith('/warden/') && user.role !== 'warden') {
    // Redirect non-wardens away from warden routes
    let redirectPath = '/dashboard';
    if (user.role === 'admin') {
      redirectPath = '/admin';
    } else if (user.role === 'staff') {
      redirectPath = '/staff/dashboard';
    }
    return <Navigate to={redirectPath} replace />;
  }

  if (currentPath.startsWith('/admin/') && user.role !== 'admin') {
    // Redirect non-admins away from admin routes
    let redirectPath = '/dashboard';
    if (user.role === 'warden') {
      redirectPath = '/warden/dashboard';
    } else if (user.role === 'staff') {
      redirectPath = '/staff/dashboard';
    }
    return <Navigate to={redirectPath} replace />;
  }

  if (currentPath.startsWith('/staff/') && user.role !== 'staff') {
    // Redirect non-staff away from staff routes
    let redirectPath = '/dashboard';
    if (user.role === 'admin') {
      redirectPath = '/admin';
    } else if (user.role === 'warden') {
      redirectPath = '/warden/dashboard';
    }
    return <Navigate to={redirectPath} replace />;
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
