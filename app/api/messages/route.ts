import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Opret en direkte Supabase-klient til API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET handler til at hente alle beskeder fra Supabase
 * 
 * @returns JSON response med alle beskeder
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase forespørgselsfejl:', error);
      return NextResponse.json(
        { error: 'Fejl ved hentning af beskeder' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: data });
  } catch (error) {
    console.error('Uventet fejl ved hentning af beskeder:', error);
    return NextResponse.json(
      { error: 'Uventet fejl ved hentning af beskeder' },
      { status: 500 }
    );
  }
}

/**
 * POST handler til at gemme en ny besked i Supabase
 * 
 * @param request - Next.js request objekt med beskeddata
 * @returns JSON response med bekræftelse eller fejlbesked
 */
export async function POST(request: NextRequest) {
  try {
    // Parse JSON data fra request
    const { name, email, message, imageUrl } = await request.json();
    
    if (!message || !name || !email) {
      return NextResponse.json(
        { error: 'Manglende nødvendige felter (navn, email eller besked)' },
        { status: 400 }
      );
    }

    // Indsæt besked i Supabase database
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { 
          name, 
          email, 
          message, 
          image: imageUrl || null,
          timestamp: new Date().toISOString() 
        }
      ])
      .select();

    if (error) {
      console.error('Supabase database fejl:', error);
      return NextResponse.json(
        { error: 'Fejl ved gemning af besked' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Besked gemt succesfuldt',
      data 
    });
  } catch (error) {
    console.error('Uventet fejl ved gemning af besked:', error);
    return NextResponse.json(
      { error: 'Uventet fejl ved gemning af besked' },
      { status: 500 }
    );
  }
} 