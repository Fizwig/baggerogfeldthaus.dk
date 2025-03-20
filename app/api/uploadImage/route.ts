import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Opret en direkte Supabase-klient til API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * API Route til at uploade billeder til Supabase Storage
 * 
 * @param request - Next.js request objekt med FormData indeholdende billedet
 * @returns JSON response med URL til det uploadede billede eller fejlbesked
 */
export async function POST(request: NextRequest) {
  try {
    // Få FormData fra request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Intet billede modtaget' },
        { status: 400 }
      );
    }

    // Generer et unikt filnavn baseret på timestamp og originalt filnavn
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    
    // Upload fil til Supabase Storage 'images' bucket
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload fejl:', error);
      return NextResponse.json(
        { error: 'Fejl ved upload af billede' },
        { status: 500 }
      );
    }

    // Få den offentlige URL til det uploadede billede
    const imageUrl = supabase.storage
      .from('images')
      .getPublicUrl(fileName).data.publicUrl;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Uventet fejl ved billedupload:', error);
    return NextResponse.json(
      { error: 'Uventet fejl ved billedupload' },
      { status: 500 }
    );
  }
} 