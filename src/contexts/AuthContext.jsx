import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser, signOut } from '../lib/supabase'
import SessionTimeoutWarning from '../components/SessionTimeoutWarning'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)
  const [warningTimeLeft, setWarningTimeLeft] = useState(0)

  // Session timeout settings DISABLED as requested
  // No timeout - sessions will persist until manual logout
  const SESSION_TIMEOUT = Infinity // No timeout
  const MAX_SESSION_TIME = Infinity // No maximum session time
  const WARNING_TIME = Infinity // No warning

  // Function to clear all authentication data
  const clearAllAuthData = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('lastActivity')
    sessionStorage.removeItem('sessionStart')
    sessionStorage.setItem('explicitLogout', 'true') // Mark as explicitly logged out
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Clear all Supabase auth data from sessionStorage
    const supabaseKeys = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('sb-')) {
        supabaseKeys.push(key)
      }
    }
    supabaseKeys.forEach(key => sessionStorage.removeItem(key))

    setUser(null)
  }

  // Function to update last activity timestamp
  const updateLastActivity = () => {
    sessionStorage.setItem('lastActivity', Date.now().toString())
  }

  // Function to check if session is expired or needs warning
  const checkSessionStatus = () => {
    const lastActivity = sessionStorage.getItem('lastActivity')
    const sessionStart = sessionStorage.getItem('sessionStart')
    const now = Date.now()

    if (!lastActivity || !sessionStart) {
      return { expired: true, showWarning: false, timeLeft: 0 }
    }

    const timeSinceLastActivity = now - parseInt(lastActivity)
    const totalSessionTime = now - parseInt(sessionStart)

    // Check if session is expired
    const isExpired = timeSinceLastActivity > SESSION_TIMEOUT || totalSessionTime > MAX_SESSION_TIME

    if (isExpired) {
      return { expired: true, showWarning: false, timeLeft: 0 }
    }

    // Check if we should show warning
    const timeUntilInactivityTimeout = SESSION_TIMEOUT - timeSinceLastActivity
    const timeUntilMaxTimeout = MAX_SESSION_TIME - totalSessionTime
    const timeUntilTimeout = Math.min(timeUntilInactivityTimeout, timeUntilMaxTimeout)

    const shouldShowWarning = timeUntilTimeout <= WARNING_TIME

    return {
      expired: false,
      showWarning: shouldShowWarning,
      timeLeft: Math.ceil(timeUntilTimeout / 1000) // Convert to seconds
    }
  }

  // Function to check if session is expired (backward compatibility)
  const isSessionExpired = () => {
    return checkSessionStatus().expired
  }

  // Function to handle session expiry
  const handleSessionExpiry = async () => {
    setShowTimeoutWarning(false)

    // Clear all auth data including Supabase
    await signOut() // Clear Supabase auth first
    clearAllAuthData()
    setUser(null) // Ensure user state is cleared

    // Show alert to user
    alert('Your session has expired for security reasons. Please log in again.')
    // Redirect to home page
    window.location.href = '/'
  }

  // Function to extend session
  const extendSession = () => {
    updateLastActivity()
    setShowTimeoutWarning(false)
    setWarningTimeLeft(0)
  }

  // Function to handle manual logout from warning
  const handleWarningLogout = async () => {
    setShowTimeoutWarning(false)
    await logout()
    window.location.href = '/'
  }

  // Function to check current auth state
  const checkAuthState = async () => {
    // First check for session auth (sessionStorage - clears on window close)
    const sessionToken = sessionStorage.getItem('token')
    const sessionUserData = sessionStorage.getItem('user')

    if (sessionToken && sessionUserData) {
      // Check if session is expired
      if (isSessionExpired()) {
        handleSessionExpiry()
        return null
      }

      try {
        const parsedUser = JSON.parse(sessionUserData)
        // Update last activity since user is active
        updateLastActivity()
        setUser(parsedUser)
        return parsedUser
      } catch (error) {
        console.error('Error parsing session user data:', error)
        clearAllAuthData()
      }
    }

    // Fallback to localStorage for backward compatibility, but clear it
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // Move to sessionStorage and clear localStorage
        const now = Date.now().toString()
        sessionStorage.setItem('token', token)
        sessionStorage.setItem('user', userData)
        sessionStorage.setItem('sessionStart', now)
        sessionStorage.setItem('lastActivity', now)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(parsedUser)
        return parsedUser
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    // Only check Supabase auth if no session data exists and no explicit logout
    const wasLoggedOut = sessionStorage.getItem('explicitLogout')
    if (!wasLoggedOut) {
      try {
        const { user, error } = await getCurrentUser()
        if (error) {
          // Supabase auth not available or no session - this is expected when using JWT auth
          // silent
          setUser(null)
          return null
        }
        if (user) {
          // If Supabase user exists, set up session tracking
          const now = Date.now().toString()
          sessionStorage.setItem('sessionStart', now)
          sessionStorage.setItem('lastActivity', now)
        }
        setUser(user)
        return user
      } catch (error) {
        // Supabase not available or configured - this is expected when using JWT auth
        // silent
        setUser(null)
        return null
      }
    }

    // If explicitly logged out, don't check Supabase
    setUser(null)
    return null
  }

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      await checkAuthState()
      setLoading(false)
    }

    getInitialUser()

    // Set up activity monitoring
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    const handleUserActivity = () => {
      if (user) {
        updateLastActivity()
      }
    }

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })

    // Set up periodic session checking (every 10 seconds for better responsiveness)
    const sessionCheckInterval = setInterval(() => {
      // Don't check session if explicitly logged out
      const wasLoggedOut = sessionStorage.getItem('explicitLogout')
      if (wasLoggedOut) {
        setUser(null)
        setShowTimeoutWarning(false)
        return
      }

      if (user) {
        const status = checkSessionStatus()

        if (status.expired) {
          handleSessionExpiry()
        } else if (status.showWarning && !showTimeoutWarning) {
          setShowTimeoutWarning(true)
          setWarningTimeLeft(status.timeLeft)
        } else if (status.showWarning && showTimeoutWarning) {
          setWarningTimeLeft(status.timeLeft)
        } else if (!status.showWarning && showTimeoutWarning) {
          setShowTimeoutWarning(false)
          setWarningTimeLeft(0)
        }
      }
    }, 10000) // Check every 10 seconds

    // Listen for auth changes
    const { data: { subscription } } = supabase ? supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Prevent multiple simultaneous auth processing
        if (isProcessingAuth) {
          return
        }
        
        
        setIsProcessingAuth(true)
        
        // Set a timeout to reset the processing flag in case of errors
        const processingTimeout = setTimeout(() => {
          setIsProcessingAuth(false)
        }, 10000) // 10 second timeout

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const supabaseUser = session?.user
          setUser(supabaseUser || null)

          // For ANY sign-in (including Google), sync user with MongoDB
          if (event === 'SIGNED_IN' && supabaseUser) {
            // silent

            // Always sync Supabase users with MongoDB
            const syncedUser = await syncSupabaseUserWithMongoDB(supabaseUser)

            // After sync, fetch the latest user data to ensure we have all profile updates
            if (syncedUser) {
              // silent
              try {
                const token = sessionStorage.getItem('token')
                if (token) {
                  const response = await fetch('http://localhost:5000/api/user/profile', {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  })

                  if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.user) {
                      const updatedUser = {
                        ...data.user,
                        id: data.user.id || data.user._id,
                        role: data.user.role,
                        authProvider: data.user.authProvider
                      }
                      // silent
                      sessionStorage.setItem('user', JSON.stringify(updatedUser))
                      setUser(updatedUser)
                    }
                  }
                }
              } catch (error) {
                console.warn('Failed to fetch fresh user data after sync:', error)
              }
            }

            // Clear history to prevent going back and navigate to appropriate dashboard
            setTimeout(() => {
              const dashboardPath = syncedUser?.role === 'admin' ? '/admin' : '/dashboard'
              window.history.pushState(null, '', dashboardPath)
            }, 100)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          // Clear all auth data when Supabase signs out
          clearAllAuthData()
        }
        setLoading(false)
        clearTimeout(processingTimeout)
        setIsProcessingAuth(false)
      }
    ) : { data: { subscription: { unsubscribe: () => {} } } }

    // Function to sync Supabase user with MongoDB
    const syncSupabaseUserWithMongoDB = async (supabaseUser) => {
      try {

        const response = await fetch('http://localhost:5000/api/auth/sync-oauth-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ supabaseUser })
        })

        

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ HTTP Error:', response.status, errorText)
          return
        }

        const data = await response.json()

        if (data.success) {
          // Store MongoDB user data and token in sessionStorage (clears on window close)
          const now = Date.now().toString()
          sessionStorage.setItem('token', data.token)
          sessionStorage.setItem('user', JSON.stringify(data.user))
          sessionStorage.setItem('sessionStart', now)
          sessionStorage.setItem('lastActivity', now)
          sessionStorage.removeItem('explicitLogout') // Clear logout flag

          // Return user data so we can use it for navigation
          return data.user
        } else {
          console.error('❌ Sync failed:', data.msg || 'Unknown error')
          return null
        }
      } catch (error) {
        console.error('❌ Network/Parse error during sync:', error)
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
      }
    }

    return () => {
      subscription?.unsubscribe()

      // Clean up activity listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })

      // Clear session check interval
      clearInterval(sessionCheckInterval)
    }
  }, [])

  const logout = async () => {
    setLoading(true)

    // Clear Supabase auth first
    await signOut()

    // Clear all authentication data including Supabase sessionStorage
    clearAllAuthData()

    // Always clear user state
    setUser(null)
    setLoading(false)

    return { success: true }
  }

  const refreshUser = async () => {
    return await checkAuthState()
  }

  // Function to fetch fresh user data from database
  const fetchFreshUserData = async () => {
    try {
      const token = sessionStorage.getItem('token')
      if (!token) {
        return null
      }

      
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch fresh user data:', response.status)
        return null
      }

      const data = await response.json()

      if (data.success && data.user) {
        // Update sessionStorage with fresh data
        const updatedUser = {
          ...data.user,
          // Preserve important fields that might not be in the profile response
          id: data.user.id || data.user._id,
          role: data.user.role,
          authProvider: data.user.authProvider
        }

        sessionStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return updatedUser
      }

      return null
    } catch (error) {
      console.error('Error fetching fresh user data:', error)
      return null
    }
  }

  // Function to validate and refresh Supabase session
  const validateSupabaseSession = async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session validation error:', sessionError)
        throw new Error('Authentication session error. Please log in again.')
      }

      if (!session) {
        throw new Error('No active session found. Please log in again.')
      }

      // Get current user to ensure session is valid
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('User validation error:', userError)
        throw new Error('Failed to validate user session. Please log in again.')
      }

      if (!currentUser) {
        throw new Error('User not found. Please log in again.')
      }

      return { session, user: currentUser }
    } catch (error) {
      console.error('Session validation failed:', error)
      throw error
    }
  }

  // Login function (for programmatic login after successful auth)
  const login = (userData, token) => {
    const now = Date.now().toString()
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('user', JSON.stringify(userData))
    sessionStorage.setItem('sessionStart', now)
    sessionStorage.setItem('lastActivity', now)
    sessionStorage.removeItem('explicitLogout')
    setUser(userData)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    fetchFreshUserData,
    validateSupabaseSession,
    clearAllAuthData,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Session timeout warning disabled as requested */}
      {false && (
        <SessionTimeoutWarning
          isVisible={showTimeoutWarning}
          timeLeft={warningTimeLeft}
          onExtendSession={extendSession}
          onLogout={handleWarningLogout}
        />
      )}
    </AuthContext.Provider>
  )
}
