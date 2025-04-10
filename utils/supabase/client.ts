import { createClient } from '@supabase/supabase-js';

// Tjek at miljøvariablerne er definerede
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validér miljøvariabler
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 KRITISK FEJL: Supabase miljøvariabler mangler:', {
    url: supabaseUrl ? 'defineret' : 'MANGLER',
    anonKey: supabaseAnonKey ? 'defineret (start: ' + supabaseAnonKey.substring(0, 5) + '...)' : 'MANGLER'
  });
}

// Log til konsollen med en klar markør
console.log('🔌 SUPABASE CLIENT: Initialiserer med URL:', supabaseUrl);

// Opret og konfigurer Supabase klienten med ekstra information
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  global: {
    headers: {
      'x-application-name': 'strik-brevkasse',
      'x-client-info': 'client-ts@1.0.0'
    },
  },
  db: {
    schema: 'public',
  },
  // Deaktivér mulitTab da vi ikke har behov for det
  multiTab: false,
  // Slå debug til for at se mere information
  debug: process.env.NODE_ENV !== 'production'
};

/**
 * Opretter en Supabase klient til browser-side brug
 * Bruges i komponenter der kører på klienten
 */
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  options
);

// Tilføj listener for at kunne logge alle fejl
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔑 Supabase Auth Event:', event, session ? 'Session findes' : 'Ingen session');
});

// Eksporter URL'en så den kan bruges andre steder
export const SUPABASE_URL = supabaseUrl;

// Log success message hvis det lykkes
console.log('✅ Supabase klient initialiseret og klar til brug!'); 