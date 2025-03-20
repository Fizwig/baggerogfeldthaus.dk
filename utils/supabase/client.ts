import { createClient } from '@supabase/supabase-js';

// Tjek at miljøvariablerne er definerede
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('KRITISK FEJL: Supabase miljøvariabler mangler:', {
    url: supabaseUrl ? 'defineret' : 'MANGLER',
    anonKey: supabaseAnonKey ? 'defineret' : 'MANGLER'
  });
}

console.log('Initializing Supabase with URL:', supabaseUrl);

/**
 * Opretter en Supabase klient til browser-side brug
 * Bruges i komponenter der kører på klienten
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