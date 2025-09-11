'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { AppUser } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  appUser: AppUser | null
  loading: boolean
  error: string | null
  isOnline: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>
  signUp: (email: string, password: string, name: string, role?: 'ADMIN' | 'USER') => Promise<{ error?: string; success?: boolean }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const supabase = createClient()

  // Enhanced logging utility
  const logAuth = (action: string, details: unknown = {}, level: 'info' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toISOString()
    const logMessage = `[AuthContext ${level.toUpperCase()}] ${timestamp} - ${action}`
    
    console.group(logMessage)
    console.log('Details:', details)
    console.log('Current user:', user?.id || 'none')
    console.log('Loading state:', loading)
    console.log('Online status:', isOnline)
    console.groupEnd()
  }

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      logAuth('Network status changed', { status: 'online' })
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setError('Connection lost. Please check your internet connection.')
      logAuth('Network status changed', { status: 'offline' }, 'warn')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearError = () => {
    setError(null)
    logAuth('Error cleared')
  }

  const fetchAppUser = async (supabaseUser: User | null) => {
    if (!supabaseUser) {
      setAppUser(null)
      logAuth('Clearing app user', { reason: 'no supabase user' })
      return
    }

    if (!isOnline) {
      logAuth('Skipping app user fetch', { reason: 'offline' }, 'warn')
      return
    }

    logAuth('Fetching app user', { supabaseUserId: supabaseUser.id })

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseId: supabaseUser.id }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const userData = await response.json()
        setAppUser(userData)
        logAuth('App user fetched successfully', { 
          userId: userData.id, 
          role: userData.role,
          name: userData.name 
        })
      } else {
        const errorText = await response.text()
        setAppUser(null)
        logAuth('Failed to fetch app user', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorText 
        }, 'error')
        
        if (response.status >= 500) {
          setError('Server error. Please try again later.')
        } else if (response.status === 404) {
          setError('User profile not found. Please contact support.')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logAuth('Error fetching app user', { error: errorMessage }, 'error')
      setAppUser(null)
      
      // Don't show error for aborted requests (timeout)
      if (errorMessage.includes('aborted')) {
        logAuth('App user fetch timed out, continuing without app user data')
      } else if (errorMessage.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('Failed to load user profile. Please try again.')
      }
    }
  }

  const refreshUser = async () => {
    logAuth('Refreshing user data')
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        logAuth('Error refreshing user', { error: error.message }, 'error')
        setError('Failed to refresh user session. Please sign in again.')
        return
      }
      
      setUser(currentUser)
      await fetchAppUser(currentUser)
      logAuth('User refresh completed', { hasUser: !!currentUser })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logAuth('Exception during user refresh', { error: errorMessage }, 'error')
      setError('Session refresh failed. Please sign in again.')
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      logAuth('Getting initial session')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          logAuth('Error getting initial session', { error: error.message }, 'error')
          setError('Failed to restore session. Please sign in.')
          setUser(null)
          setAppUser(null)
        } else {
          setUser(session?.user ?? null)
          if (session?.user) {
            logAuth('Initial session found', { userId: session.user.id })
            try {
              await fetchAppUser(session.user)
            } catch (fetchError) {
              logAuth('Error fetching app user during init', { error: fetchError }, 'error')
              // Continue even if fetchAppUser fails
            }
          } else {
            logAuth('No initial session found')
            setAppUser(null)
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logAuth('Exception getting initial session', { error: errorMessage }, 'error')
        setError('Failed to initialize authentication. Please refresh the page.')
        setUser(null)
        setAppUser(null)
      } finally {
        // ALWAYS set loading to false to prevent infinite loading
        setLoading(false)
        logAuth('Initial session check completed, loading set to false')
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logAuth('Auth state changed', { event, hasSession: !!session, userId: session?.user?.id })
      
      clearError() // Clear any previous errors on auth state change
      
      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        // IMMEDIATE state cleanup for smooth transitions
        setUser(null)
        setAppUser(null)
        setLoading(false)
        logAuth('User signed out, clearing all state')
        
        // Force clear any cached data immediately
        if (typeof window !== 'undefined') {
          // Clear any potential cached state that might cause flash
          localStorage.removeItem('sidebar-pinned')
          sessionStorage.clear()
          
          // Clear any component-specific cache
          try {
            Object.keys(localStorage).forEach(key => {
              if (key.includes('sidebar') || key.includes('auth') || key.includes('user')) {
                localStorage.removeItem(key)
              }
            })
          } catch (e) {
            // Ignore errors clearing cache
          }
        }
        return
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchAppUser(session.user)
        } else {
          setAppUser(null)
        }
        setLoading(false)
        return
      }
      
      // Handle other events
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchAppUser(session.user)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })

    return () => {
      logAuth('Unsubscribing from auth changes')
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    clearError()
    logAuth('Sign in attempt', { email: email.replace(/(.{3}).*@/, '$1***@') })
    
    if (!isOnline) {
      const error = 'No internet connection. Please check your network and try again.'
      logAuth('Sign in failed', { reason: 'offline' }, 'error')
      return { error }
    }

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        let userFriendlyError = error.message
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyError = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyError = 'Please check your email and click the confirmation link before signing in.'
        } else if (error.message.includes('Too many requests')) {
          userFriendlyError = 'Too many login attempts. Please wait a moment and try again.'
        } else if (error.message.includes('Signup disabled')) {
          userFriendlyError = 'Sign up is currently disabled. Please contact support.'
        }
        
        logAuth('Sign in failed', { 
          originalError: error.message,
          userFriendlyError,
          code: error.status 
        }, 'error')
        
        return { error: userFriendlyError }
      }
      
      logAuth('Sign in successful', { 
        userId: data.user?.id,
        email: data.user?.email?.replace(/(.{3}).*@/, '$1***@')
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logAuth('Sign in exception', { error: errorMessage }, 'error')
      
      let userError = 'An unexpected error occurred during sign in.'
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        userError = 'Network error. Please check your connection and try again.'
      }
      
      return { error: userError }
    }
  }

  const signUp = async (email: string, password: string, name: string, role: 'ADMIN' | 'USER' = 'USER') => {
    clearError()
    logAuth('Sign up attempt', { 
      email: email.replace(/(.{3}).*@/, '$1***@'),
      name: name.substring(0, 3) + '***',
      role 
    })
    
    if (!isOnline) {
      const error = 'No internet connection. Please check your network and try again.'
      logAuth('Sign up failed', { reason: 'offline' }, 'error')
      return { error }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      })
      
      if (error) {
        let userFriendlyError = error.message
        
        // Provide more user-friendly error messages
        if (error.message.includes('User already registered')) {
          userFriendlyError = 'An account with this email already exists. Please sign in instead.'
        } else if (error.message.includes('Invalid email')) {
          userFriendlyError = 'Please enter a valid email address.'
        } else if (error.message.includes('Password should be at least')) {
          userFriendlyError = 'Password must be at least 6 characters long.'
        } else if (error.message.includes('Signup disabled')) {
          userFriendlyError = 'Registration is currently disabled. Please contact support.'
        }
        
        logAuth('Sign up failed', { 
          originalError: error.message,
          userFriendlyError,
          code: error.status 
        }, 'error')
        
        return { error: userFriendlyError }
      }

      // Create user record in our database
      if (data.user) {
        logAuth('Creating user record in database', { userId: data.user.id })
        
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supabaseId: data.user.id,
              email: data.user.email,
              name,
              role
            })
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            logAuth('Failed to create user record', { 
              status: response.status,
              error: errorText 
            }, 'error')
            
            // Don't fail the entire signup, but log the issue
            console.warn('User created in Supabase but failed to create in database. This may cause issues.')
          } else {
            logAuth('User record created successfully')
          }
        } catch (dbError) {
          const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown error'
          logAuth('Exception creating user record', { error: errorMessage }, 'error')
          
          // Don't fail the entire signup, but log the issue
          console.warn('User created in Supabase but failed to create in database. This may cause issues.')
        }
      }
      
      logAuth('Sign up successful', { 
        userId: data.user?.id,
        needsConfirmation: !data.session,
        email: data.user?.email?.replace(/(.{3}).*@/, '$1***@')
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logAuth('Sign up exception', { error: errorMessage }, 'error')
      
      let userError = 'An unexpected error occurred during registration.'
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        userError = 'Network error. Please check your connection and try again.'
      }
      
      return { error: userError }
    }
  }

  const signOut = async () => {
    logAuth('Sign out initiated')
    
    // IMMEDIATE state cleanup to prevent flash content
    setUser(null)
    setAppUser(null)
    setLoading(false) // Ensure loading state is false to prevent flash
    clearError()
    
    // Clear all cached state immediately
    if (typeof window !== 'undefined') {
      // Clear localStorage to prevent sidebar state persistence
      localStorage.removeItem('sidebar-pinned')
      localStorage.clear() // Clear all localStorage
      sessionStorage.clear() // Clear all sessionStorage
      
      // Clear Supabase auth cache
      try {
        // Clear various possible Supabase auth token keys
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (supabaseUrl) {
          const domain = supabaseUrl.split('://')[1]
          localStorage.removeItem(`sb-${domain}-auth-token`)
        }
        
        // Clear any other auth-related localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase-auth') || key.includes('sb-') && key.includes('auth')) {
            localStorage.removeItem(key)
          }
        })
      } catch (e) {
        // Ignore errors clearing cache
      }
    }
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        logAuth('Sign out error', { error: error.message }, 'error')
      } else {
        logAuth('Sign out successful')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logAuth('Sign out exception', { error: errorMessage }, 'error')
    }
    
    // Force redirect after cleanup (remove the immediate redirect to allow state changes first)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 50) // Small delay to allow state updates to complete
    }
  }

  const value = {
    user,
    appUser,
    loading,
    error,
    isOnline,
    signIn,
    signUp,
    signOut,
    refreshUser,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}