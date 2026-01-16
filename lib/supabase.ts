import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface GroceryItem {
  id: string
  user_id?: string
  name: string
  quantity: string
  created_at?: string
}

export interface Store {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  price_score: number
  quality_score: number
  opening_hours: string
  created_at?: string
}

export interface Bill {
  id: string
  user_id?: string
  store_name: string
  items: any[]
  total: number
  date: string
  image_url?: string
  created_at?: string
}

export interface Feedback {
  id: string
  user_id?: string
  rating: number
  comment: string
  category: string
  ai_suggestion?: string
  created_at?: string
}
