import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Opret en Supabase-klient med ANON key (skal bruges til public API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log miljøoplysninger for at identificere forskelle mellem lokalt og Vercel
const environment = process.env.VERCEL ? 'Vercel' : 'Lokalt';
console.log(`🔒 Kører i ${environment} miljø`);
console.log('📌 Supabase URL:', supabaseUrl);
console.log('🔑 Supabase ANON Key tilgængelig:', !!supabaseAnonKey);
console.log('🌐 NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'Ikke defineret');

// Initialiser Supabase klienten
const supabase = createClient(
  supabaseUrl!,
  supabaseAnonKey!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

/**
 * API Route til at uploade billeder til Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    // Log for at bekræfte at API ruten kaldes
    console.log(`☎️ API-route: /api/simpleupload er kaldt fra ${environment} miljø`);
    
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
    
    // Gem lokalt som backup i public/uploads mappen (kun lokalt miljø)
    let localPath = '';
    try {
      if (!process.env.VERCEL) { // Kun forsøg at gemme lokalt hvis ikke på Vercel
        const publicUploadDir = join(process.cwd(), 'public', 'uploads');
        await writeFile(join(publicUploadDir, fullFileName), buffer);
        localPath = `/uploads/${fullFileName}`;
        console.log(`💾 Fil gemt lokalt: ${fullFileName}`);
      } else {
        console.log('⏩ Springer lokal gemning over på Vercel');
      }
    } catch (writeError) {
      console.error('❌ Kunne ikke gemme fil lokalt:', writeError);
      // Vi fortsætter med Supabase upload selvom lokal lagring fejler
    }
    
    // Upload til Supabase med direkte path-angivelse
    const bucketName = 'brevkasse-billeder';
    
    // Forsøg forskellige mapper baseret på Supabase policies
    const possibleFolders = ['p06g4u_0', 'p06g4u_1', 'p06g4u_2', 'p06g4u_3', 'uploads'];
    let uploadSuccess = false;
    let uploadError = null;
    let uploadData = null;
    let publicUrl = '';
    
    // Forsøg hver mappe indtil en virker
    for (const folder of possibleFolders) {
      if (uploadSuccess) break;
      
      const fullPath = `${folder}/${fullFileName}`;
      console.log(`☁️ Forsøger upload til Supabase: bucket=${bucketName}, path=${fullPath}`);
      
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
          console.error(`❌ Supabase upload fejl i mappe ${folder}:`, error.message);
          uploadError = error;
          continue; // Prøv næste mappe
        }
        
        console.log(`✅ Supabase upload success til ${folder}:`, data);
        uploadData = data;
        uploadSuccess = true;
        
        // Hent offentlig URL til filen
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fullPath);
        
        if (!urlData || !urlData.publicUrl) {
          console.error('❌ Kunne ikke generere offentlig URL for', fullPath);
          continue; // Prøv næste mappe
        }
        
        publicUrl = urlData.publicUrl;
        console.log(`🔗 Genereret offentlig URL: ${publicUrl}`);
        
        // Test om URL'en er tilgængelig
        try {
          const testResponse = await fetch(publicUrl, { method: 'HEAD' });
          console.log(`🧪 URL Test: Status=${testResponse.status}, OK=${testResponse.ok}`);
          
          if (testResponse.ok) {
            // URL virker, vi er færdige
            break;
          } else {
            console.warn(`⚠️ URL genereret men returnerer ${testResponse.status}`);
            // Fortsæt til næste mappe
          }
        } catch (testError) {
          console.error('⚠️ URL Test fejl:', testError);
          // Fortsæt til næste mappe
        }
      } catch (folderError) {
        console.error(`❌ Fejl ved upload til mappe ${folder}:`, folderError);
        // Fortsæt til næste mappe
      }
    }
    
    // Efter afprøvning af alle mapper
    if (uploadSuccess && publicUrl) {
      console.log('✅ Upload vellykket, returnerer URL:', publicUrl);
      return NextResponse.json({
        success: true,
        url: publicUrl
      });
    }
    
    // Hvis vi når hertil, er upload fejlet for alle mapper
    console.error('❌ Alle upload-forsøg fejlede');
    
    // Forsøg at bruge lokal URL som fallback
    if (localPath) {
      const fallbackUrl = new URL(localPath, process.env.NEXT_PUBLIC_SITE_URL || 'https://bagger-feldthaus.vercel.app').toString();
      console.log(`🔄 Bruger lokal URL som fallback: ${fallbackUrl}`);
      
      return NextResponse.json({
        success: false,
        error: uploadError ? uploadError.message : 'Alle upload-forsøg fejlede',
        url: fallbackUrl
      });
    }
    
    // Absolut sidste udvej - fejl uden URL
    return NextResponse.json({
      success: false,
      error: 'Kunne ikke uploade billede til nogen mappe og ingen lokal fallback tilgængelig'
    }, { status: 500 });
  } catch (error) {
    console.error('❌ Fatal fejl i API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ukendt fejl i API route',
        environment,
        supabaseAvailable: !!supabaseUrl && !!supabaseAnonKey
      },
      { status: 500 }
    );
  }
} 