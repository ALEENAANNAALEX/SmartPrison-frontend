import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => { // Provides notifications state and helper methods
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info', // default type
      title: '',
      message: '',
      duration: 5000, // default 5 seconds
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error') => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 6000
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Info') => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 4000
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
