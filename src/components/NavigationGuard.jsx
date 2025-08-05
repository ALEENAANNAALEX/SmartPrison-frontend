import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Disable browser navigation shortcuts
    const handleKeyDown = (e) => {
      // Disable backspace navigation (except in input fields)
      if (e.key === 'Backspace' &&
          e.target.tagName !== 'INPUT' &&
          e.target.tagName !== 'TEXTAREA' &&
          !e.target.isContentEditable) {
        e.preventDefault();
      }

      // Disable Alt + Arrow keys (browser back/forward)
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
      }

      // Disable F5 refresh
      if (e.key === 'F5') {
        e.preventDefault();
      }

      // Disable Ctrl+R refresh
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
      }

      // Disable Ctrl+Shift+R hard refresh
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
      }

      // Disable browser developer tools shortcuts
      if (e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
      }
    };

    // Handle browser back/forward button clicks
    const handlePopState = (e) => {
      // Check if this is an OAuth flow
      const currentUrl = window.location.href;
      const isOAuthFlow = currentUrl.includes('accounts.google.com') ||
                         currentUrl.includes('oauth') ||
                         currentUrl.includes('supabase') ||
                         document.referrer.includes('accounts.google.com');

      // Allow OAuth navigation, prevent other navigation
      if (isOAuthFlow) {
        return; // Allow the navigation
      }

      // Prevent the default back/forward behavior for non-OAuth cases
      e.preventDefault();

      // Push the current state back to maintain position
      window.history.pushState(null, '', window.location.href);

      // Silent prevention - no alerts or confirmations
    };

    // Handle page unload/refresh attempts (allow OAuth)
    const handleBeforeUnload = (e) => {
      // Check if OAuth is in progress
      const oauthInProgress = sessionStorage.getItem('oauth-in-progress') === 'true';

      // Check if this is an OAuth redirect
      const currentUrl = window.location.href;
      const isOAuthRedirect = currentUrl.includes('accounts.google.com') ||
                             currentUrl.includes('oauth') ||
                             currentUrl.includes('supabase') ||
                             currentUrl.includes('auth') ||
                             document.referrer.includes('accounts.google.com') ||
                             oauthInProgress;

      // Allow OAuth redirects, prevent other navigation
      if (isOAuthRedirect || oauthInProgress) {
        console.log('🔓 OAuth flow detected in NavigationGuard - allowing navigation');
        return undefined; // Allow navigation
      }

      // Silent prevention for other cases - no confirmation dialog
      e.preventDefault();
      return undefined;
    };

    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Disable text selection (optional)
    const handleSelectStart = (e) => {
      // Allow selection in input fields and textareas
      if (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Disable drag and drop (optional)
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Push initial state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    // Add CSS to disable text selection and dragging
    const style = document.createElement('style');
    style.textContent = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }
      
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Hide browser navigation buttons in fullscreen mode */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      
      // Remove the style
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [location.pathname]);

  // This component doesn't render anything
  return null;
};

export default NavigationGuard;
