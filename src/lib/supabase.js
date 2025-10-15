import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Only create client if we have valid credentials
export const supabase = (supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-anon-key')
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: window.sessionStorage, // Use sessionStorage instead of localStorage
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Use PKCE flow for better security
      },
      global: {
        headers: {
          'X-Client-Info': 'prison-management-system'
        }
      }
    })
  : null

// Google Sign In function
export const signInWithGoogle = async () => {
  try {
    if (!supabase) {
      return { error: 'Supabase not configured. Please set up your environment variables.' }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account' // This forces Google to show account selection
        }
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error.message)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Sign out function
export const signOut = async () => {
  try {
    if (!supabase) {
      return { success: true } // If no supabase, just return success
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
      return { error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error('Unexpected error during sign out:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    if (!supabase) {
      return { user: null }
    }

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error.message)
      return { error: error.message }
    }
    return { user }
  } catch (error) {
    console.error('Unexpected error getting user:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Listen to auth changes
export const onAuthStateChange = (callback) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  return supabase.auth.onAuthStateChange(callback)
}

// Refresh session if needed
export const refreshSession = async () => {
  try {
    if (!supabase) {
      return { error: 'Supabase not configured' }
    }

    const { data, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('Error refreshing session:', error.message)
      return { error: error.message }
    }
    return { data }
  } catch (error) {
    console.error('Unexpected error refreshing session:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Validate current session
export const validateSession = async () => {
  try {
    if (!supabase) {
      throw new Error('Supabase is not configured')
    }

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error('Authentication session error. Please log in again.')
    }

    if (!session) {
      throw new Error('No active session found. Please log in again.')
    }

    // Get current user to ensure session is valid
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      throw new Error('Failed to validate user session. Please log in again.')
    }

    if (!user) {
      throw new Error('User not found. Please log in again.')
    }

    return { session, user }
  } catch (error) {
    // Only log errors in development mode to avoid console spam
    if (process.env.NODE_ENV === 'development') {
      console.warn('Session validation failed:', error.message)
    }
    throw error
  }
}
