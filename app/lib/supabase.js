import { createClient } from '@supabase/supabase-js';

// Check that environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: Supabase environment variables missing:', {
    url: supabaseUrl ? 'defined' : 'MISSING',
    anonKey: supabaseAnonKey ? 'defined' : 'MISSING'
  });
}

/**
 * Creates a Supabase client for browser-side use
 * Used in components that run on the client
 */
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    global: {
      headers: {
        'x-application-name': 'strik-brevkasse'
      },
    },
  }
); 