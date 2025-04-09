import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Opret en Supabase-klient - bruger anon key men med server-side kode
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Simplere API Route til at uploade billeder med FormData
 * Gemmer først lokalt og uploader derefter til Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Ingen fil modtaget' },
        { status: 400 }
      );
    }
    
    // Generer unikt filnavn
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileName = `${timestamp}-${randomStr}`;
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fullFileName = `${fileName}.${fileExt}`;
    
    console.log(`Server modtog fil: ${file.name}, størrelse: ${file.size} bytes, type: ${file.type}`);
    
    // Læs fildata
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Gem filen i public/uploads mappen først som fallback
    const publicUploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await writeFile(join(publicUploadDir, fullFileName), buffer);
      console.log(`Fil gemt lokalt: ${fullFileName}`);
    } catch (writeError) {
      console.error('Kunne ikke gemme fil lokalt:', writeError);
      // Fortsæt selvom lokal gem fejler
    }
    
    // Prøv at uploade til Supabase
    let supabaseUrl = '';
    try {
      // Brug kun én mappe for konsistens
      const path = `billeder/${fullFileName}`;
      console.log(`Uploading til Supabase path: ${path}`);
      
      const { data, error } = await supabase.storage
        .from('brevkasse-billeder')
        .upload(path, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        throw new Error(`Supabase upload fejl: ${error.message}`);
      }
      
      // Hent public URL
      const { data: urlData } = supabase.storage
        .from('brevkasse-billeder')
        .getPublicUrl(path);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Kunne ikke hente public URL fra Supabase');
      }
      
      supabaseUrl = urlData.publicUrl;
      console.log('Supabase upload succes. Public URL:', supabaseUrl);
      
      // Sikre at URL'en er korrekt formateret
      if (!supabaseUrl.startsWith('http')) {
        supabaseUrl = `https://${supabaseUrl}`;
        console.log('Korrigeret URL:', supabaseUrl);
      }
    } catch (uploadError) {
      console.error('Supabase upload fejlede:', uploadError);
      // Hvis Supabase upload fejlede, brug lokal URL
      supabaseUrl = `/uploads/${fullFileName}`;
      console.log('Bruger lokal URL som fallback:', supabaseUrl);
    }
    
    // Verificer at URL'en er gyldig
    try {
      new URL(supabaseUrl.startsWith('/') ? `https://example.com${supabaseUrl}` : supabaseUrl);
    } catch (urlError) {
      console.error('Ugyldig URL genereret:', supabaseUrl, urlError);
      // Sidste chance fallback
      supabaseUrl = `/uploads/${fullFileName}`;
    }
    
    return NextResponse.json({
      success: true,
      url: supabaseUrl,
      fileName: fullFileName,
      fileType: file.type,
      fileSize: file.size
    });
  } catch (error) {
    console.error('Uventet fejl ved filupload:', error);
    if (error instanceof Error) {
      console.error('Fejlbesked:', error.message);
    }
    
    return NextResponse.json(
      { error: 'Uventet fejl ved filupload' },
      { status: 500 }
    );
  }
} 