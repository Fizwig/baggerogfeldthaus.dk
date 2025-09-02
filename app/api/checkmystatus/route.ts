import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_BUCKET } from '@/utils/supabase/client';

// Definer Supabase-klient med korrekt URL og ANON key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialiser Supabase klienten (kun via miljøvariabler)
const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Definer typer for resultat-objektet
type BucketInfo = {
  name: string;
  public: boolean;
  created_at: string;
};

type FileInfo = {
  name: string;
  size: any;
  type: any;
  created: string;
};

type TestResult = {
  success: boolean;
  error?: string;
  fileData?: any;
  publicUrl?: string;
};

type StatusResult = {
  status: string;
  supabase: {
    url: string | undefined;
    hasAnonKey: boolean;
    keyStart: string;
  };
  client: {
    initialized: boolean;
    hasStorage: boolean;
  };
  buckets: (BucketInfo | string)[];
  pictures: FileInfo[] | string[];
  policies: any[];
  test: Partial<TestResult>;
};

export async function GET() {
  try {
    const results: StatusResult = {
      status: 'ok',
      supabase: {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        keyStart: supabaseAnonKey ? supabaseAnonKey.substring(0, 8) + '...' : 'missing',
      },
      client: {
        initialized: !!supabase,
        hasStorage: !!supabase?.storage,
      },
      buckets: [],
      pictures: [],
      policies: [],
      test: {}
    };

    // 1. Tjek om vi kan hente buckets
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        results.buckets = [`Error: ${error.message}`];
      } else {
        results.buckets = buckets.map(b => ({
          name: b.name,
          public: b.public,
          created_at: b.created_at
        }));
        
        // Tjek om bucket findes
        const brevkasseBucket = buckets.find(b => b.name === SUPABASE_BUCKET);
        
        if (!brevkasseBucket) {
          console.log(`⚠️ ${SUPABASE_BUCKET} bucket mangler - forsøger at oprette den`);
          
          // Forsøg at oprette bucket
          try {
            const { data, error } = await supabase.storage.createBucket(SUPABASE_BUCKET, {
              public: true
            });
            
            if (error) {
              console.error('❌ Kunne ikke oprette bucket:', error.message);
              results.buckets.push(`Kunne ikke oprette ${SUPABASE_BUCKET}: ${error.message}`);
            } else {
              console.log('✅ Bucket oprettet:', data);
              results.buckets.push(`${SUPABASE_BUCKET} bucket oprettet`);
            }
          } catch (err) {
            console.error('❌ Fejl ved bucket oprettelse:', err);
            results.buckets.push(`Exception ved bucket oprettelse: ${err instanceof Error ? err.message : String(err)}`);
          }
        } else if (!brevkasseBucket.public) {
          // Hvis bucketen findes men ikke er offentlig, gør den offentlig
          console.log(`⚠️ ${SUPABASE_BUCKET} bucket er ikke offentlig - forsøger at opdatere`);
          
          try {
            const { error } = await supabase.storage.updateBucket(SUPABASE_BUCKET, {
              public: true
            });
            
            if (error) {
              console.error('❌ Kunne ikke opdatere bucket til offentlig:', error.message);
              results.buckets.push(`Kunne ikke opdatere ${SUPABASE_BUCKET} til offentlig: ${error.message}`);
            } else {
              console.log('✅ Bucket opdateret til offentlig');
              results.buckets.push(`${SUPABASE_BUCKET} bucket opdateret til offentlig`);
            }
          } catch (err) {
            console.error('❌ Fejl ved bucket opdatering:', err);
            results.buckets.push(`Exception ved bucket opdatering: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
    } catch (err) {
      results.buckets = [`Exception: ${err instanceof Error ? err.message : String(err)}`];
    }

    // 2. Tjek om vi kan hente filer fra bucket
    try {
      const { data: files, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .list('uploads');
      
      if (error) {
        results.pictures = [`Error: ${error.message}`];
      } else if (files) {
        results.pictures = files.map(f => ({
          name: f.name,
          size: f.metadata?.size,
          type: f.metadata?.mimetype,
          created: f.created_at || ''
        }));
      }
    } catch (err) {
      results.pictures = [`Exception: ${err instanceof Error ? err.message : String(err)}`];
    }

    // 3. Test uploading et lille billede
    try {
      // Opret et lille testbillede (1x1 transparent pixel i base64)
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const bin = Buffer.from(base64, 'base64');
      const testFile = `test-${Date.now()}.png`;

      // Upload til Supabase
      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(`uploads/${testFile}`, bin, {
          contentType: 'image/png',
          upsert: true
        });

      if (error) {
        results.test = { 
          success: false, 
          error: error.message 
        };
      } else {
        // Hent URL til testbilledet
        const { data: urlData } = supabase.storage
          .from(SUPABASE_BUCKET)
          .getPublicUrl(`uploads/${testFile}`);

        results.test = {
          success: true,
          fileData: data,
          publicUrl: urlData?.publicUrl
        };
      }
    } catch (err) {
      results.test = {
        success: false,
        error: err instanceof Error ? err.message : String(err)
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Ukendt fejl'
      },
      { status: 500 }
    );
  }
} 