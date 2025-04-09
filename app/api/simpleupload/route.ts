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
      // Brug de specifikke mapper der matcher policies fra Supabase dashboard
      const bucketName = 'brevkasse-billeder';
      const policyFolders = ['p06g4u_0', 'p06g4u_1', 'p06g4u_2', 'p06g4u_3'];
      let uploaded = false;
      
      // Forsøg at uploade til hver folder indtil en lykkes
      for (const folder of policyFolders) {
        if (uploaded) break;
        
        const path = `${folder}/${fullFileName}`;
        console.log(`Forsøger upload til bucket: ${bucketName}, path: ${path}`);
        
        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(path, buffer, {
              contentType: file.type,
              cacheControl: '3600',
              upsert: true
            });
            
          if (!error) {
            console.log(`Upload lykkedes til ${bucketName}/${path}`);
            
            // Brug getPublicUrl til at få den offentlige URL
            const { data: urlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(path);
              
            if (urlData && urlData.publicUrl) {
              supabaseUrl = urlData.publicUrl;
              console.log('Supabase URL genereret:', supabaseUrl);
              uploaded = true;
              break;
            }
          } else {
            console.error(`Fejl ved upload til ${folder}:`, error);
          }
        } catch (folderError) {
          console.error(`Fejl ved forsøg på at uploade til ${folder}:`, folderError);
        }
      }
      
      if (!uploaded) {
        // Hvis ingen af mapperne virkede, brug lokal URL som fallback
        supabaseUrl = `/uploads/${fullFileName}`;
        console.log('Kunne ikke uploade til nogen mappe, bruger lokal URL som fallback:', supabaseUrl);
      }
    } catch (uploadError) {
      console.error('Supabase upload fejlede fuldstændigt:', uploadError);
      // Hvis Supabase upload fejlede, brug lokal URL
      supabaseUrl = `/uploads/${fullFileName}`;
      console.log('Bruger lokal URL som fallback:', supabaseUrl);
    }
    
    // Log den endelige URL
    console.log('Returnerer URL:', supabaseUrl);
    
    return NextResponse.json({
      success: true,
      url: supabaseUrl
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