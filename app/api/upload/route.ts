import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Opret en server-side Supabase-klient med service role key
// VIGTIGT: Sørg for at tilføje SUPABASE_SERVICE_ROLE_KEY til .env.local
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * API Route til at uploade billeder til Supabase Storage
 * Denne route omgår RLS policies ved at bruge server-side service role key
 */
export async function POST(request: NextRequest) {
  try {
    // Få JSON data fra request
    const data = await request.json();
    const { fileName, fileData, fileType } = data;
    
    if (!fileName || !fileData) {
      return NextResponse.json(
        { error: 'Manglende fil data' },
        { status: 400 }
      );
    }

    console.log(`Server modtog upload-anmodning for fil: ${fileName}, type: ${fileType}`);
    
    // Dekoder base64 data til buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    // Brug en specifik mappe path der matcher policies fra screenshots
    // Prøv en specifik path som vi kan se fra Supabase policy screenshots
    const folderPath = 'p0/eget_0';
    const fullPath = `${folderPath}/${fileName}`;
    
    console.log(`Forsøger at uploade til path: ${fullPath}`);
    
    // Upload fil til Supabase Storage
    const { data: uploadData, error } = await supabaseAdmin.storage
      .from(SUPABASE_BUCKET)
      .upload(fullPath, buffer, {
        contentType: fileType || 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Server: Supabase Storage upload fejl:', error);
      
      // Log flere detaljer for fejlfinding
      console.error('Error detaljer:', JSON.stringify(error, null, 2));
      console.error('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.error('Service role key tilgængelig:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      
      return NextResponse.json(
        { error: `Fejl ved upload af billede: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Server: Upload lykkedes:', uploadData);
    
    // Få den offentlige URL til det uploadede billede
    const { data: urlData } = supabaseAdmin.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(fullPath);

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Kunne ikke generere offentlig URL' },
        { status: 500 }
      );
    }

    console.log('Server: Public URL genereret:', urlData.publicUrl);

    return NextResponse.json({ 
      success: true, 
      url: urlData.publicUrl 
    });
  } catch (error) {
    console.error('Server: Uventet fejl ved billedupload:', error);
    if (error instanceof Error) {
      console.error('Fejldetaljer:', error.message);
      console.error('Stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Uventet fejl ved billedupload' },
      { status: 500 }
    );
  }
} 