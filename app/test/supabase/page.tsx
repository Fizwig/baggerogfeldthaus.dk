'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, SUPABASE_URL } from '@/utils/supabase/client';

export default function SupabaseTestPage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('');
  const [files, setFiles] = useState<any[]>([]);
  const [testUrls, setTestUrls] = useState<{[key: string]: string}>({});
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hent alle tilgængelige buckets
  const fetchBuckets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Fejl ved hentning af buckets:', error);
        setError(`Fejl ved hentning af buckets: ${error.message}`);
        return;
      }
      
      console.log('Buckets:', data);
      setBuckets(data || []);
      
      // Auto-select brevkasse-billeder bucket hvis det findes
      const brevkasseBucket = data?.find(b => b.name === 'brevkasse-billeder');
      if (brevkasseBucket) {
        setSelectedBucket(brevkasseBucket.name);
        await fetchFiles(brevkasseBucket.name);
      }
    } catch (err) {
      console.error('Uventet fejl:', err);
      setError(`Uventet fejl: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Hent filer fra en bestemt bucket
  const fetchFiles = async (bucketName: string) => {
    if (!bucketName) return;
    
    try {
      setLoading(true);
      setFiles([]);
      setTestUrls({});
      setTestResults({});
      
      const { data, error } = await supabase.storage.from(bucketName).list();
      
      if (error) {
        console.error('Fejl ved hentning af filer:', error);
        setError(`Fejl ved hentning af filer: ${error.message}`);
        return;
      }
      
      console.log('Filer i bucket:', data);
      setFiles(data || []);
      
      // Hvis der er mapper, hent også deres indhold
      const folders = data?.filter(item => item.id === null) || [];
      
      for (const folder of folders) {
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from(bucketName)
          .list(folder.name);
          
        if (folderError) {
          console.error(`Fejl ved hentning af filer i ${folder.name}:`, folderError);
          continue;
        }
        
        console.log(`Filer i ${folder.name}:`, folderFiles);
        
        // Tilføj mappenavn til filerne
        const filesWithPath = folderFiles?.map(file => ({
          ...file,
          path: `${folder.name}/${file.name}`
        })) || [];
        
        setFiles(prev => [...prev, ...filesWithPath]);
      }
    } catch (err) {
      console.error('Uventet fejl:', err);
      setError(`Uventet fejl: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Generer offentlig URL til en fil
  const generateUrl = (file: any) => {
    try {
      const filePath = file.path || file.name;
      
      // Generer URL med getPublicUrl
      const { data } = supabase.storage
        .from(selectedBucket)
        .getPublicUrl(filePath);
        
      if (data?.publicUrl) {
        setTestUrls(prev => ({
          ...prev,
          [filePath]: data.publicUrl
        }));
        
        // Test URL'en
        testUrl(filePath, data.publicUrl);
      }
    } catch (err) {
      console.error('Fejl ved generering af URL:', err);
      setTestResults(prev => ({
        ...prev,
        [file.path || file.name]: `Fejl: ${err instanceof Error ? err.message : String(err)}`
      }));
    }
  };

  // Test om en URL er tilgængelig
  const testUrl = async (filePath: string, url: string) => {
    try {
      setTestResults(prev => ({
        ...prev,
        [filePath]: 'Tester...'
      }));
      
      const response = await fetch(url, { method: 'HEAD' });
      
      setTestResults(prev => ({
        ...prev,
        [filePath]: `Status: ${response.status}, OK: ${response.ok}`
      }));
    } catch (err) {
      console.error('Fejl ved test af URL:', err);
      setTestResults(prev => ({
        ...prev,
        [filePath]: `Fejl: ${err instanceof Error ? err.message : String(err)}`
      }));
    }
  };

  // Upload testfil
  const uploadTestFile = async () => {
    try {
      setLoading(true);
      
      // Opret en enkel test-fil
      const testData = 'Dette er en test fil fra Supabase test siden';
      const testFile = new Blob([testData], { type: 'text/plain' });
      
      // Upload til en test-mappe
      const testFileName = `test-file-${Date.now()}.txt`;
      const folderPath = 'p06g4u_0'; // Brug foldernavnet fra policies
      const filePath = `${folderPath}/${testFileName}`;
      
      const { data, error } = await supabase.storage
        .from(selectedBucket)
        .upload(filePath, testFile, {
          contentType: 'text/plain',
          upsert: true
        });
        
      if (error) {
        console.error('Fejl ved upload af testfil:', error);
        setError(`Fejl ved upload af testfil: ${error.message}`);
        return;
      }
      
      console.log('Testfil uploadet:', data);
      alert('Testfil uploadet! Opdaterer filliste...');
      
      // Genindlæs filer
      await fetchFiles(selectedBucket);
    } catch (err) {
      console.error('Uventet fejl ved upload:', err);
      setError(`Uventet fejl ved upload: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Indlæs buckets når siden åbnes
  useEffect(() => {
    fetchBuckets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-pink-400 mb-2">Supabase Storage Test</h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-sm text-pink-300 hover:underline"
            >
              Tilbage til forsiden
            </Link>
            <Link 
              href="/opslagstavle" 
              className="text-sm text-pink-300 hover:underline"
            >
              Opslagstavle
            </Link>
            <Link 
              href="/brevkasse" 
              className="text-sm text-pink-300 hover:underline"
            >
              Brevkasse
            </Link>
          </div>
          <div className="mt-2 text-sm text-pink-300/70">
            Supabase URL: {SUPABASE_URL}
          </div>
        </header>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 p-4 rounded-md mb-6">
            <h3 className="font-bold text-red-400 mb-1">Fejl:</h3>
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Supabase Buckets</h2>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {buckets.map(bucket => (
                <button
                  key={bucket.id}
                  onClick={() => {
                    setSelectedBucket(bucket.name);
                    fetchFiles(bucket.name);
                  }}
                  className={`px-3 py-1.5 rounded-md ${
                    selectedBucket === bucket.name
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {bucket.name}
                </button>
              ))}
            </div>
            
            {loading && <p className="text-gray-400">Indlæser...</p>}
            
            {selectedBucket && (
              <button
                onClick={uploadTestFile}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 rounded-md text-white mt-2"
                disabled={loading}
              >
                Upload testfil til {selectedBucket}
              </button>
            )}
          </div>
          
          {selectedBucket && (
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">
                Filer i <span className="text-pink-400">{selectedBucket}</span>
              </h2>
              
              {loading ? (
                <p className="text-gray-400">Indlæser filer...</p>
              ) : files.length === 0 ? (
                <p className="text-gray-400">Ingen filer fundet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-2">Navn</th>
                        <th className="text-left p-2">Størrelse</th>
                        <th className="text-left p-2">Actions</th>
                        <th className="text-left p-2">URL</th>
                        <th className="text-left p-2">Test</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file, index) => (
                        <tr 
                          key={index} 
                          className="border-b border-gray-700 hover:bg-gray-700/30"
                        >
                          <td className="p-2 font-mono whitespace-nowrap">
                            {file.path || file.name}
                          </td>
                          <td className="p-2">
                            {file.metadata?.size 
                              ? `${Math.round(file.metadata.size / 1024)} KB` 
                              : '-'}
                          </td>
                          <td className="p-2">
                            <button
                              onClick={() => generateUrl(file)}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs"
                            >
                              Generer URL
                            </button>
                          </td>
                          <td className="p-2 max-w-xs truncate">
                            {testUrls[file.path || file.name] || '-'}
                          </td>
                          <td className="p-2">
                            {testResults[file.path || file.name] || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Test Billeder</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(testUrls).map(([path, url]) => (
                <div key={path} className="bg-gray-700/50 rounded-lg p-3 break-words">
                  <p className="text-xs mb-2 font-mono">{path}</p>
                  <p className="text-xs text-gray-400 mb-2">{url}</p>
                  
                  <div className="aspect-video relative bg-black/50 rounded flex items-center justify-center overflow-hidden">
                    {/* Viser billedet direkte med img tag */}
                    <img 
                      src={url}
                      alt={path}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        console.error(`Fejl ved indlæsning af billede: ${url}`);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const errorMsg = document.createElement('p');
                          errorMsg.className = 'text-red-400 text-center text-xs';
                          errorMsg.textContent = 'Billedet kunne ikke indlæses';
                          parent.appendChild(errorMsg);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs">
                      Status: <span className={testResults[path]?.includes('OK: true') 
                        ? 'text-green-400' 
                        : 'text-red-400'
                      }>
                        {testResults[path] || 'Ikke testet'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 