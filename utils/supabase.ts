import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || useRuntimeConfig().public.supabaseUrl
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || useRuntimeConfig().public.supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
