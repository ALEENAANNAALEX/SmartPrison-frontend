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
        detectSessionInUrl: true
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
        redirectTo: `${window.location.origin}/dashboard`
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
