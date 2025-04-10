import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Opret en Supabase-klient med ANON key (skal bruges til public API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log detaljeret information om Supabase konfiguration (uden at vise hele nøglen)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase ANON Key tilgængelig:', !!supabaseAnonKey);
console.log('Supabase ANON Key start:', supabaseAnonKey?.substring(0, 10) + '...');

// Initialiser Supabase klienten
const supabase = createClient(
  supabaseUrl!,
  supabaseAnonKey!
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
    
    // Gem lokalt som backup i public/uploads mappen
    try {
      const publicUploadDir = join(process.cwd(), 'public', 'uploads');
      await writeFile(join(publicUploadDir, fullFileName), buffer);
      console.log(`💾 Fil gemt lokalt: ${fullFileName}`);
    } catch (writeError) {
      console.error('❌ Kunne ikke gemme fil lokalt:', writeError);
      // Vi fortsætter med Supabase upload selvom lokal lagring fejler
    }
    
    // Upload til Supabase med direkte path-angivelse
    const bucketName = 'brevkasse-billeder';
    const folderName = 'p06g4u_0'; // Brug altid den samme folder for enkelthedens skyld
    const fullPath = `${folderName}/${fullFileName}`;
    
    console.log(`☁️ Uploader til Supabase: bucket=${bucketName}, path=${fullPath}`);
    
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
        
        // Returner den lokale URL som fallback
        const localUrl = `/uploads/${fullFileName}`;
        console.log(`🔄 Bruger lokal URL: ${localUrl}`);
        
        return NextResponse.json({
          success: false,
          error: error.message,
          url: localUrl // Returnerer stadig en brugbar URL
        });
      }
      
      console.log('✅ Supabase upload success:', data);
      
      // Hent offentlig URL til filen
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fullPath);
      
      if (!urlData || !urlData.publicUrl) {
        console.error('❌ Kunne ikke generere offentlig URL');
        
        // Returner den lokale URL som fallback
        const localUrl = `/uploads/${fullFileName}`;
        console.log(`🔄 Bruger lokal URL: ${localUrl}`);
        
        return NextResponse.json({
          success: false,
          error: 'Kunne ikke generere offentlig URL',
          url: localUrl
        });
      }
      
      const publicUrl = urlData.publicUrl;
      console.log(`🔗 Genereret offentlig URL: ${publicUrl}`);
      
      // Test om URL'en er tilgængelig (valgfrit men kan hjælpe med fejlfinding)
      try {
        const testResponse = await fetch(publicUrl, { method: 'HEAD' });
        console.log(`🧪 URL Test: Status=${testResponse.status}, OK=${testResponse.ok}`);
      } catch (testError) {
        console.error('⚠️ URL Test fejl (kan ignoreres):', testError);
      }
      
      // Returner success response med publicUrl
      return NextResponse.json({
        success: true,
        url: publicUrl
      });
    } catch (uploadError) {
      console.error('❌ Uventet fejl ved Supabase upload:', uploadError);
      
      // Returner den lokale URL som fallback
      const localUrl = `/uploads/${fullFileName}`;
      console.log(`🔄 Bruger lokal URL: ${localUrl}`);
      
      return NextResponse.json({
        success: false,
        error: uploadError instanceof Error ? uploadError.message : 'Ukendt uploadfejl',
        url: localUrl
      });
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