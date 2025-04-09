'use server';

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Opret en Supabase-klient
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
    
    // Upload til Supabase
    const folder = 'p0/eget_0'; // Brug kun én mappe for konsistens
    const path = `${folder}/${fullFileName}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('brevkasse-billeder')
        .upload(path, buffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error('Supabase upload fejl:', error);
        throw error;
      }
      
      // Hent public URL
      const { data: urlData } = supabase.storage
        .from('brevkasse-billeder')
        .getPublicUrl(path);
        
      if (!urlData?.publicUrl) {
        throw new Error('Kunne ikke generere public URL');
      }
      
      console.log('Upload success, public URL:', urlData.publicUrl);
      
      return NextResponse.json({
        success: true,
        url: urlData.publicUrl
      });
      
    } catch (uploadError) {
      console.error('Supabase upload fejlede:', uploadError);
      
      // Gem lokalt som fallback
      const publicUploadDir = join(process.cwd(), 'public', 'uploads');
      await writeFile(join(publicUploadDir, fullFileName), buffer);
      
      return NextResponse.json({
        success: true,
        url: `/uploads/${fullFileName}`
      });
    }
  } catch (error) {
    console.error('Uventet fejl ved filupload:', error);
    return NextResponse.json(
      { error: 'Kunne ikke uploade fil' },
      { status: 500 }
    );
  }
} 