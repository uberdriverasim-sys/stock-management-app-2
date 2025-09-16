import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

// Database types (based on our schema)
export type User = {
  id: string
  username: string
  name: string
  role: 'admin' | 'warehouse' | 'shop'
  city?: 'SYDNEY' | 'MELBOURNE' | 'BRISBANE'
  created_at: string
}

export type Product = {
  id: string
  sku: string
  name: string
  quantity: number
  created_at: string
  updated_at: string
}

export type Request = {
  id: string
  user_id: string
  product_id: string
  shop_name: string
  shop_location: string
  requested_quantity: number
  status: 'pending' | 'approved' | 'dispatched' | 'cancelled'
  notes?: string
  created_at: string
}

export type CompanySetting = {
  id: string
  setting_key: string
  setting_value?: string
  created_at: string
  updated_at: string
}

