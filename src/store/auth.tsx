import { createContext, useContext, useEffect, useState } from 'react'
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session:', session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      if (!session?.user) {
        setLoading(false)
      }
    })

    // Listen for auth changes - NO database queries here
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (!session?.user) {
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Separate useEffect for profile loading - this is the key fix!
  useEffect(() => {
    if (session?.user) {
      console.log('👤 Session found, loading profile for:', session.user.id)
      loadUserProfile(session.user.id)
    }
  }, [session])

  const loadUserProfile = async (authUserId: string) => {
    try {
      console.log('👤 Loading user profile for:', authUserId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

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
      console.error('💥 Unexpected error loading user profile:', err)
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
        return { success: false, message: error.message }
      }

      console.log('✅ Sign in successful')
      return { success: true, message: 'Sign in successful' }
    } catch (err) {
      console.error('💥 Sign in error:', err)
      return { success: false, message: 'Sign in failed' }
    } finally {
      setLoading(false)
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
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('❌ Sign up error:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ Sign up successful')
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
