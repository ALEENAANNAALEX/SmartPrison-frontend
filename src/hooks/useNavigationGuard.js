import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useNavigationGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // COMPLETELY DISABLE back button when logged in
      const disableBackButton = () => {
        // Push current state to prevent going back
        window.history.pushState(null, '', window.location.pathname);
      };

      // Immediately disable back button
      disableBackButton();

      // Handle any attempt to use back button
      const handlePopState = (event) => {
        // Prevent the back navigation
        event.preventDefault();

        // Stay on current page by pushing state again
        disableBackButton();

        // Optional: Show a message that back button is disabled
        console.log('Back button is disabled while logged in');
      };

      // Listen for back/forward button attempts
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
    // When user is null (logged out), don't add any listeners
    // This allows normal back button functionality
  }, [user, location.pathname]);

  // Also handle direct URL access to auth pages when logged in
  useEffect(() => {
    const authPages = ['/login', '/forgot-password'];
    const currentPath = location.pathname;

    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (user && authPages.includes(currentPath)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);
};
