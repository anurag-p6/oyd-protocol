import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  throw new Error('Missing required Supabase environment variables')
}

console.log('Supabase client initialized with URL:', supabaseUrl)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DatabaseDataset {
  id: string
  company_name: string
  data_name: string
  data_description: string
  category: string
  cid: string
  timestamp: string
  file_size: number
  uploader_address: string
  uploaded_by: string
  oyd_cost: number
  downloads: number
  created_at: string
}
