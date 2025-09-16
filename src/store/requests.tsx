import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Request } from '../lib/supabase'

type RequestContextType = {
  requests: Request[]
  addRequest: (request: Omit<Request, 'id' | 'created_at' | 'user_id' | 'status'>, userId: string) => Promise<{ success: boolean; message: string }>
  updateRequestStatus: (id: string, status: 'pending' | 'approved' | 'dispatched' | 'cancelled') => Promise<{ success: boolean; message: string }>
  removeRequest: (id: string) => Promise<{ success: boolean; message: string }>
  clearAll: () => Promise<{ success: boolean; message: string }>
  loading: boolean
  refreshRequests: () => Promise<void>
}

const RequestContext = createContext<RequestContextType | null>(null)

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  // Load requests from Supabase on mount
  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      console.log('📋 Loading requests from Supabase...')
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading requests:', error)
        return
      }

      console.log('✅ Loaded requests:', data?.length || 0)
      setRequests(data || [])
    } catch (err) {
      console.error('💥 Unexpected error loading requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshRequests = async () => {
    await loadRequests()
  }

  const addRequest = async (requestData: Omit<Request, 'id' | 'created_at' | 'user_id' | 'status'>, userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📋 Adding request:', requestData)

      const { data, error } = await supabase
        .from('requests')
        .insert([{
          ...requestData,
          user_id: userId,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) {
        console.error('❌ Error adding request:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ Request added:', data)
      await refreshRequests()
      return { success: true, message: 'Request submitted successfully!' }
    } catch (err) {
      console.error('💥 Error adding request:', err)
      return { success: false, message: 'Failed to submit request' }
    }
  }

  const updateRequestStatus = async (id: string, status: 'pending' | 'approved' | 'dispatched' | 'cancelled'): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('📝 Updating request status:', { id, status })
      
      const { data, error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating request:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ Request status updated:', data)
      await refreshRequests()
      return { success: true, message: `Request ${status} successfully` }
    } catch (err) {
      console.error('💥 Error updating request:', err)
      return { success: false, message: 'Failed to update request' }
    }
  }

  const removeRequest = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🗑️ Removing request:', id)
      
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error removing request:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ Request removed')
      await refreshRequests()
      return { success: true, message: 'Request removed successfully' }
    } catch (err) {
      console.error('💥 Error removing request:', err)
      return { success: false, message: 'Failed to remove request' }
    }
  }

  const clearAll = async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🧹 Clearing all requests...')
      
      const { error } = await supabase
        .from('requests')
        .delete()
        .neq('id', 'impossible-id') // Delete all rows

      if (error) {
        console.error('❌ Error clearing requests:', error)
        return { success: false, message: error.message }
      }

      console.log('✅ All requests cleared')
      await refreshRequests()
      return { success: true, message: 'All requests cleared successfully' }
    } catch (err) {
      console.error('💥 Error clearing requests:', err)
      return { success: false, message: 'Failed to clear requests' }
    }
  }

  const value: RequestContextType = {
    requests,
    addRequest,
    updateRequestStatus,
    removeRequest,
    clearAll,
    loading,
    refreshRequests
  }

  return (
    <RequestContext.Provider value={value}>
      {children}
    </RequestContext.Provider>
  )
}

export function useRequests() {
  const context = useContext(RequestContext)
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider')
  }
  return context
}
