import { createClient } from '@supabase/supabase-js';

// Tjek at miljøvariablerne er definerede
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'Brevkasse Billeder';

// Validér miljøvariabler
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 KRITISK FEJL: Supabase miljøvariabler mangler:', {
    url: supabaseUrl ? 'defineret' : 'MANGLER',
    anonKey: supabaseAnonKey ? 'defineret (start: ' + supabaseAnonKey.substring(0, 5) + '...)' : 'MANGLER'
  });
  
  // I production, brug fallback værdier hvis miljøvariabler mangler
  if (typeof window !== 'undefined') {
    console.warn('⚠️ Bruger fallback Supabase konfiguration');
  }
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
  supabaseUrl || 'https://jwtiblsahzksgpbdgtj.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBlcmJhc2UiLCJyZWYiOiJqd3RpYmxzYWh6a3NncGJkZ3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIzMTYwNTAsImV4cCI6MjAxNzg5MjA1MH0.jAxM0VyNakrHrVaUBBMRbcCkFKSgjQEeBraE_93cP-nOmMSvw',
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