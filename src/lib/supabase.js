import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fail-safe check to prevent crashes if environment variables are missing
const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'your_supabase_url' && 
  supabaseUrl.includes('.supabase.co'); // Basic URL validation

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder-project.supabase.co', 'placeholder-key');
