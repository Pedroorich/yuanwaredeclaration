import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if configuration is valid to avoid crashing on startup
export const isSupabaseConfigured = 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes('your_supabase_url');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as SupabaseClient;
