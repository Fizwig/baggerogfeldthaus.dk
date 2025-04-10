import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Definer Supabase-klient med korrekt URL og ANON key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log detaljeret information om Supabase konfiguration (uden at vise hele nøglen)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase ANON Key tilgængelig:', !!supabaseAnonKey);
if (supabaseAnonKey) {
  console.log('Supabase ANON Key start:', supabaseAnonKey.substring(0, 10) + '...');
}

// Initialiser Supabase klienten
const supabase = createClient(
  supabaseUrl || 'https://jwtiblsahzksgpbdgtj.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBlcmJhc2UiLCJyZWYiOiJqd3RpYmxzYWh6a3NncGJkZ3RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIzMTYwNTAsImV4cCI6MjAxNzg5MjA1MH0.jAxM0VyNakrHrVaUBBMRbcCkFKSgjQEeBraE_93cP-nOmMSvw'
);

/**
 * API Route til at uploade billeder til Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    // Log for at bekræfte at API ruten kaldes
    console.log('☎️ API-route: /api/simpleupload er kaldt');
    
    // Hent formdata fra request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Valider filen
    if (!file) {
      console.error('🚫 Ingen fil modtaget i formData');
      return NextResponse.json(
        { error: 'Ingen fil modtaget' },
        { status: 400 }
      );
    }
    
    console.log(`📁 Modtog fil: ${file.name}, størrelse: ${file.size} bytes, type: ${file.type}`);
    
    // Opret et unikt filnavn baseret på timestamp og et tilfældigt tal
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fullFileName = `${timestamp}-${randomStr}.${fileExt}`;
    
    console.log(`📄 Opretter filnavn: ${fullFileName}`);
    
    // Konverter fil til buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Gem IKKE længere lokalt som backup - vi bruger kun Supabase
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`🌍 Kører i ${isProduction ? 'produktion' : 'udvikling'} miljø`);
    
    // Upload til Supabase med direkte path-angivelse
    const bucketName = 'brevkasse-billeder';
    const folderName = 'uploads'; // Brug en simpel mappe navn
    const fullPath = `${folderName}/${fullFileName}`;
    
    console.log(`☁️ Uploader til Supabase: bucket=${bucketName}, path=${fullPath}`);
    
    // Forøg log detaljer
    console.log('Supabase klient initialiseret:', !!supabase);
    console.log('Supabase Storage API tilgængelig:', !!supabase?.storage);
    console.log('Supabase bucket API tilgængelig:', !!supabase?.storage?.from);

    try {
      // Upload fil til Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fullPath, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('❌ Supabase upload fejl:', error.message);
        throw new Error(`Supabase upload fejl: ${error.message}`);
      }
      
      console.log('✅ Supabase upload success:', data);
      
      // Hent offentlig URL til filen
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fullPath);
      
      if (!urlData || !urlData.publicUrl) {
        console.error('❌ Kunne ikke generere offentlig URL');
        throw new Error('Kunne ikke generere offentlig URL');
      }
      
      const publicUrl = urlData.publicUrl;
      console.log(`🔗 Genereret offentlig URL: ${publicUrl}`);
      
      // Test om URL'en er tilgængelig
      try {
        const testResponse = await fetch(publicUrl, { method: 'HEAD' });
        console.log(`🧪 URL Test: Status=${testResponse.status}, OK=${testResponse.ok}`);
      } catch (testError) {
        console.warn('⚠️ URL Test fejl (kan påvirke visning):', testError);
      }
      
      // Returner success response med publicUrl
      return NextResponse.json({
        success: true,
        url: publicUrl
      });
      
    } catch (uploadError) {
      console.error('❌ Fejl ved Supabase upload:', uploadError);
      // Hvis vi fejler med Supabase upload, kan vi ikke levere et billede
      return NextResponse.json({
        success: false,
        error: uploadError instanceof Error ? uploadError.message : 'Ukendt fejl i Supabase upload'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Fatal fejl i API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ukendt fejl i API route'
      },
      { status: 500 }
    );
  }
} 