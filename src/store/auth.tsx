import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { User as AppUser } from '../lib/supabase'

type AuthContextType = {
  user: User | null
  userProfile: AppUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signUp: (email: string, password: string, metadata: {
    name: string
    username: string
    role: 'admin' | 'warehouse' | 'shop'
    city?: 'SYDNEY' | 'MELBOURNE' | 'BRISBANE'
  }) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AppUser>) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Desktop browsers sometimes have issues with getSession on refresh
        // Add a delay to let the browser settle
        if (!navigator.userAgent.includes('Mobile')) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('❌ Session error:', error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('💥 Auth initialization failed:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    }

    // Set a hard timeout for the entire initialization
    const initTimeout = setTimeout(() => {
      if (mounted && loading) {
        setSession(null)
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    }, 4000)

    // Listen for auth changes - simplified
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('🔄 Auth state change:', event, session?.user?.id || 'No user')
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user && event === 'SIGNED_IN') {
        console.log('👤 Loading profile after sign in...')
        await loadUserProfile(session.user.id)
      } else if (!session?.user) {
        console.log('👤 No user - clearing profile')
        setUserProfile(null)
        setLoading(false)
      }
    })

    initializeAuth()

    return () => {
      mounted = false
      clearTimeout(initTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (authUserId: string) => {
    try {
      console.log('👤 Loading user profile for:', authUserId)
      
      // Set a hard timeout - always stop loading after 2 seconds
      const timeoutId = setTimeout(() => {
        console.log('⚠️ Profile loading timeout - continuing without profile')
        setUserProfile(null)
        setLoading(false)
      }, 2000) // Increased to 2 seconds for database queries
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

      // Clear timeout if we got a response
      clearTimeout(timeoutId)

      if (error && error.code === 'PGRST116') {
        // No profile found - this might be an existing user without a profile
        console.log('⚠️ No user profile found, creating one from auth metadata...')
        const authUser = user
        if (authUser?.user_metadata) {
          const metadata = authUser.user_metadata
          const profileData = {
            auth_user_id: authUserId,
            username: metadata.username || authUser.email?.split('@')[0] || 'user',
            name: metadata.name || authUser.email?.split('@')[0] || 'User',
            role: (metadata.role as 'admin' | 'warehouse' | 'shop') || 'shop',
            city: metadata.city as 'SYDNEY' | 'MELBOURNE' | 'BRISBANE' | undefined
          }
          
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([profileData])
            .select()
            .single()
            
          if (createError) {
            console.error('❌ Failed to create missing profile:', createError)
            setUserProfile(null)
          } else {
            console.log('✅ Created missing user profile:', newProfile)
            setUserProfile(newProfile)
          }
        } else {
          console.log('⚠️ No metadata available to create profile')
          setUserProfile(null)
        }
        setLoading(false)
        return
      }
      
      if (error) {
        console.error('❌ Error loading user profile:', error)
        setUserProfile(null)
        setLoading(false)
        return
      }
      
      if (!data) {
        console.error('❌ No user profile found for:', authUserId)
        setUserProfile(null)
        setLoading(false)
        return
      }
      
      console.log('✅ User profile loaded:', data)
      setUserProfile(data)
      setLoading(false)
    } catch (err) {
      console.error('💥 Profile loading failed:', err)
      setUserProfile(null)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true)
      console.log('🔐 Signing in:', email)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Sign in error:', error)
        setLoading(false) // Make sure to stop loading on error
        return { success: false, message: error.message }
      }

      console.log('✅ Sign in successful')
      // Don't set loading to false here - let the auth state change handler do it
      return { success: true, message: 'Sign in successful' }
    } catch (err) {
      console.error('💥 Sign in error:', err)
      setLoading(false) // Make sure to stop loading on error
      return { success: false, message: 'Sign in failed' }
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    metadata: {
      name: string
      username: string
      role: 'admin' | 'warehouse' | 'shop'
      city?: 'SYDNEY' | 'MELBOURNE' | 'BRISBANE'
    }
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true)
      console.log('📝 Signing up:', email, metadata)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (authError) {
        console.error('❌ Sign up error:', authError)
        return { success: false, message: authError.message }
      }

      if (!authData.user) {
        console.error('❌ No user returned from signup')
        return { success: false, message: 'Failed to create user account' }
      }

      console.log('✅ Auth signup successful, creating user profile...')

      // Create user profile record in the users table
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          auth_user_id: authData.user.id,
          username: metadata.username,
          name: metadata.name,
          role: metadata.role,
          city: metadata.city
        }])

      if (profileError) {
        console.error('❌ Error creating user profile:', profileError)
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.signOut()
        return { success: false, message: `Profile creation failed: ${profileError.message}` }
      }

      console.log('✅ User profile created successfully')
      return { success: true, message: 'Account created successfully' }
    } catch (err) {
      console.error('💥 Sign up error:', err)
      return { success: false, message: 'Sign up failed' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out')
      await supabase.auth.signOut()
    } catch (err) {
      console.error('💥 Sign out error:', err)
    }
  }

  const updateProfile = async (updates: Partial<AppUser>): Promise<{ success: boolean; message: string }> => {
    if (!userProfile) {
      return { success: false, message: 'No user profile found' }
    }

    try {
      console.log('✏️ Updating profile:', updates)
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_user_id', user?.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating profile:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ Profile updated:', data)
      setUserProfile(data)
      return { success: true, message: 'Profile updated successfully' }
    } catch (err) {
      console.error('💥 Error updating profile:', err)
      return { success: false, message: 'Failed to update profile' }
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
