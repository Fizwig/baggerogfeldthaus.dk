'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/utils/supabase/client';

type FormData = {
  name: string;
  message: string;
};

type MessageData = {
  name: string;
  message: string;
  image_url: string | null;
};

// Simplified intro text with clearer instructions
const INTRO_TEXT = [
  '✨ Velkommen til Strik & Drik!',
  '🎯 Del en sjov historie, stil et spørgsmål eller del et billede',
  '⏳ Beskeder og billeder bliver automatisk slettet efter 24 timer'
];

export default function Terminal() {
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [inputLocked, setInputLocked] = useState(true);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [currentField, setCurrentField] = useState<'name' | 'message'>('name');
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, formState: { errors } } = useForm<FormData>();

  // Tilføj nye states
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isMobileKeyboardOpen, setIsMobileKeyboardOpen] = useState(false);

  useEffect(() => {
    // Display intro text with typing effect
    if (currentLine < INTRO_TEXT.length) {
      const timer = setTimeout(() => {
        setTerminalHistory(prev => [...prev, INTRO_TEXT[currentLine]]);
        setCurrentLine(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (currentLine === INTRO_TEXT.length) {
      setInputLocked(false);
      setTerminalHistory(prev => [...prev, '👤 Indtast dit navn']);
      inputRef.current?.focus();
    }
  }, [currentLine]);

  useEffect(() => {
    // Auto scroll terminal
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = inputRef.current?.value;
    if (!input) return;

    // Add user input to history with a nice prefix
    setTerminalHistory(prev => [...prev, `${currentField === 'name' ? '👤' : '💭'} ${input}`]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Special command: "opslagstavle" - navigate to bulletin board
    if (input.toLowerCase() === 'opslagstavle') {
      setTerminalHistory(prev => [...prev, `🔄 Omdirigerer til opslagstavlen...`]);
      setTimeout(() => {
        window.location.href = '/opslagstavle';
      }, 800);
      return;
    }

    if (currentField === 'name') {
      setFormData(prev => ({ ...prev, name: input }));
      setCurrentField('message');
      setTerminalHistory(prev => [...prev, '💭 Skriv din besked']);
    } else if (currentField === 'message') {
      setFormData(prev => ({ ...prev, message: input }));
      setSending(true);
      
      try {
        // Step 1: Upload image if selected
        let imageUrl = null;
        if (selectedImage) {
          setTerminalHistory(prev => [...prev, '📸 Uploader billede...']);
          imageUrl = await uploadImageToSupabase(selectedImage);
          setUploadedImageUrl(imageUrl);
          setTerminalHistory(prev => [...prev, '✅ Billede uploadet']);
        }
        
        // Step 2: Save message to database
        setTerminalHistory(prev => [...prev, '📨 Sender besked...']);
        
        const messageData: MessageData = {
          name: formData.name,
          message: input,
          image_url: imageUrl
        };
        
        const success = await saveMessageToDatabase(messageData);
        
        if (success) {
          setTerminalHistory(prev => [
            ...prev, 
            '✨ Besked sendt!',
            '📝 Din besked er nu synlig på opslagstavlen',
            '🔗 Se den på /opslagstavle'
          ]);
          
          // Reset form
          setInputLocked(true);
          setTimeout(() => {
            setTerminalHistory([]);
            setCurrentLine(0);
            setFormData({ name: '', message: '' });
            setCurrentField('name');
            setSelectedImage(null);
            setUploadedImageUrl(null);
          }, 5000);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setTerminalHistory(prev => [
          ...prev, 
          `❌ ${error instanceof Error ? error.message : 'Ukendt fejl'}`,
          '🔄 Prøv venligst igen'
        ]);
      } finally {
        setSending(false);
      }
    }
  };

  // Save message to Supabase database
  const saveMessageToDatabase = async (messageData: MessageData): Promise<boolean> => {
    try {
      console.log('Gemmer besked:', messageData);
      
      // Validate required fields
      if (!messageData.name || !messageData.message) {
        throw new Error('Navn og besked er påkrævet');
      }

      // Validate Supabase connection
      if (!supabase) {
        throw new Error('Ingen forbindelse til databasen');
      }
      
      // Create object for database with correct column names
      const dataToInsert = {
        navn: messageData.name.trim(),
        besked: messageData.message.trim(),
        created_at: new Date().toISOString(),
        likes: 0, // Initialize likes count
        ...(messageData.image_url ? { billede: messageData.image_url } : {})
      };
      
      console.log('Data til indsættelse:', dataToInsert);
      
      // Insert into the table - using the correct table name
      const { data, error } = await supabase
        .from('brevkasse_beskeder')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Fejl ved indsættelse af besked:', error);
        if (error.code === '23505') { // Unique constraint error
          throw new Error('En lignende besked er allerede sendt');
        } else if (error.code === '23503') { // Foreign key error
          throw new Error('Ugyldig reference i beskeden');
        } else if (error.code === '42P01') { // Undefined table
          throw new Error('Systemfejl: Kunne ikke finde beskedtabellen');
        } else {
          throw new Error(`Kunne ikke gemme besked: ${error.message}`);
        }
      }

      if (!data) {
        throw new Error('Ingen data returneret efter indsættelse');
      }
      
      console.log('Besked gemt i databasen:', data);
      return true;
    } catch (error) {
      console.error('Fejl ved gemning af besked:', error);
      if (error instanceof Error) {
        console.error('Fejldetaljer:', error.message);
        throw error; // Re-throw the error with the specific message
      }
      throw new Error('Kunne ikke gemme besked. Prøv venligst igen.');
    }
  };

  // Upload image to Supabase Storage
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      console.log('Starter upload af billede med størrelse:', file.size, 'bytes');
      
      if (!file || file.size === 0) {
        throw new Error('Ugyldig fil eller tom fil');
      }
      
      // Use formData for upload instead of JSON/base64
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload using fetch API with FormData
      const response = await fetch('/api/simpleupload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null) || await response.text();
        console.error('API upload fejl:', errorData);
        throw new Error(`Kunne ikke uploade billede: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Upload API svar:', result);
      
      if (!result.url) {
        throw new Error('Ingen URL returneret fra server');
      }
      
      // Return the public URL from the server response
      return result.url;
    } catch (error) {
      console.error('Fejl ved upload af billede:', error);
      
      if (error instanceof Error) {
        console.error('Fejlbesked:', error.message);
      }
      
      throw new Error('Kunne ikke uploade billede. Prøv venligst igen.');
    }
  };
  
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setTerminalHistory(prev => [...prev, `Billede valgt: ${file.name}`]);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Terminal vindue */}
      <div className="backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl overflow-hidden">
        {/* Terminal header */}
        <div className="px-4 py-3 border-b border-pink-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-purple-500/70"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500/70"></div>
          </div>
          <div className="text-pink-300/70 text-sm">
            {currentField === 'name' ? 'Indtast navn' : 'Skriv besked'}
          </div>
          <div className="w-20"></div>
        </div>

        {/* Terminal output */}
        <div
          ref={terminalRef}
          className="h-[60vh] overflow-y-auto p-4 space-y-2 font-mono text-sm sm:text-base"
        >
          {terminalHistory.map((line, i) => (
            <div key={i} className="text-white/90">{line}</div>
          ))}
          
          {/* Billede preview */}
          {selectedImage && showImagePreview && (
            <div className="relative mt-4 mb-2 p-2 bg-black/30 rounded-lg">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Valgt billede"
                className="max-h-48 rounded-lg mx-auto"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Input område */}
        <div className="border-t border-pink-500/20 p-4">
          <form onSubmit={handleInputSubmit} className="space-y-4">
            {/* Input felt med send knap */}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                disabled={inputLocked || sending}
                placeholder={currentField === 'name' ? 'Dit navn...' : 'Din besked...'}
                className="flex-1 bg-black/30 text-white px-4 py-3 rounded-lg border border-pink-500/30 focus:border-pink-500/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={inputLocked || sending}
                className="bg-pink-500/80 hover:bg-pink-500 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>

            {/* Billede upload knapper */}
            {currentField === 'message' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="flex items-center gap-2 text-pink-300 hover:text-pink-400 transition-colors text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {selectedImage ? 'Skift billede' : 'Tilføj billede'}
                    </button>
                  </div>
                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => setShowImagePreview(!showImagePreview)}
                      className="text-pink-300 hover:text-pink-400 transition-colors text-sm"
                    >
                      {showImagePreview ? 'Skjul' : 'Vis'} billede
                    </button>
                  )}
                </div>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="text-red-400 hover:text-red-500 transition-colors text-sm"
                  >
                    Fjern billede
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Hjælpetekst */}
          <div className="mt-4 text-xs text-pink-300/60">
            {currentField === 'message' ? (
              <p>Tryk på Send eller brug Enter for at sende • Tilføj et billede med kamera-ikonet</p>
            ) : (
              <p>Indtast dit navn og tryk Send eller Enter for at fortsætte</p>
            )}
          </div>
        </div>
      </div>

      {/* Skjult fil input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelection}
      />
    </div>
  );
} 