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
    <div className="w-full max-w-3xl mx-auto">
      <div 
        ref={terminalRef}
        className="font-mono text-base sm:text-lg space-y-3 sm:space-y-4 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto custom-scrollbar px-3 sm:px-0"
      >
        {terminalHistory.map((line, index) => (
          <div 
            key={index}
            className={`transition-opacity duration-300 ${
              index === terminalHistory.length - 1 ? 'animate-fade-in' : ''
            } ${
              // Styling baseret på linjetype
              index === 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-500 font-bold text-xl sm:text-2xl' : // Velkommen
              index === 1 || index === 2 ? 'text-white/90 text-sm sm:text-base' : // Undertekst
              line.includes('👤') ? 'text-pink-400' : // Navn input
              line.includes('💭') ? 'text-white' : // Besked input
              line.includes('📸') ? 'text-pink-300' : // Billede upload
              line.includes('✨') ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400' : // Success
              line.includes('❌') ? 'text-red-400' : // Fejl
              'text-pink-300/90' // Default
            }`}
          >
            <span className="break-words">{line}</span>
          </div>
        ))}
        
        {!inputLocked && (
          <form onSubmit={handleInputSubmit} className="flex items-center gap-2 mt-4 sm:mt-6 group">
            <span className="text-pink-400 group-focus-within:text-pink-300 transition-colors">❯</span>
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-pink-300/40 font-mono text-base sm:text-lg focus:ring-0"
              placeholder={currentField === 'name' ? 'Dit navn...' : 'Del din historie...'}
              disabled={sending}
              autoFocus
            />
            {currentField === 'message' && (
              <button
                type="button"
                onClick={triggerFileInput}
                className="p-2 sm:px-3 sm:py-1.5 text-pink-400 hover:text-pink-300 transition-all duration-300"
                disabled={sending}
              >
                📸
              </button>
            )}
          </form>
        )}
        
        {sending && (
          <div className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400 animate-pulse mt-4">
            <span>⏳</span>
            <span className="font-medium text-sm sm:text-base">Et øjeblik...</span>
          </div>
        )}

        {selectedImage && (
          <div className="mt-4 flex items-center gap-2 text-pink-400/80">
            <span>📎</span>
            <span className="text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[300px]">{selectedImage.name}</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelection}
        className="hidden"
      />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          @media (min-width: 640px) {
            width: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(219, 39, 119, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(219, 39, 119, 0.4);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 