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
  'STRIK & DRIK TERMINAL',
  'Skriv en besked til vores opslagstavle...',
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
      setTerminalHistory(prev => [...prev, 'Indtast dit navn:']);
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

    // Add user input to history
    setTerminalHistory(prev => [...prev, input]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    // Special command: "opslagstavle" - navigate to bulletin board
    if (input.toLowerCase() === 'opslagstavle') {
      setTerminalHistory(prev => [...prev, `Omdirigerer til opslagstavlen...`]);
      setTimeout(() => {
        window.location.href = '/opslagstavle';
      }, 800);
      return;
    }

    if (currentField === 'name') {
      setFormData(prev => ({ ...prev, name: input }));
      setCurrentField('message');
      setTerminalHistory(prev => [...prev, 'Skriv din besked:']);
    } else if (currentField === 'message') {
      setFormData(prev => ({ ...prev, message: input }));
      setSending(true);
      
      try {
        // Step 1: Upload image if selected
        let imageUrl = null;
        if (selectedImage) {
          setTerminalHistory(prev => [...prev, 'Uploader billede...']);
          imageUrl = await uploadImageToSupabase(selectedImage);
          setUploadedImageUrl(imageUrl);
          setTerminalHistory(prev => [...prev, 'Billede uploadet']);
        }
        
        // Step 2: Save message to database
        setTerminalHistory(prev => [...prev, 'Sender besked...']);
        
        const messageData: MessageData = {
          name: formData.name,
          message: input,
          image_url: imageUrl
        };
        
        const success = await saveMessageToDatabase(messageData);
        
        if (success) {
          setTerminalHistory(prev => [
            ...prev, 
            'Besked sendt!',
            'Din besked er nu synlig på opslagstavlen.',
            'Se den på /opslagstavle'
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
          'Fejl: ' + (error instanceof Error ? error.message : 'Ukendt fejl'),
          'Prøv venligst igen'
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
      
      // Create object for database with correct column names
      const dataToInsert = {
        navn: messageData.name,
        besked: messageData.message,
        created_at: new Date().toISOString(),
        ...(messageData.image_url ? { billede: messageData.image_url } : {})
      };
      
      console.log('Data til indsættelse:', dataToInsert);
      
      // Insert into the table - using the correct table name
      const { error } = await supabase
        .from('brevkasse_beskeder')
        .insert(dataToInsert);

      if (error) {
        console.error('Fejl ved indsættelse af besked:', error);
        throw new Error(`Kunne ikke gemme besked: ${error.message}`);
      }
      
      console.log('Besked gemt i databasen');
      return true;
    } catch (error) {
      console.error('Fejl ved gemning af besked:', error);
      if (error instanceof Error) {
        console.error('Fejldetaljer:', error.message);
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
    <div className="w-full max-w-2xl mx-auto backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(219,39,119,0.2)]">
      {/* Header med forbedret design */}
      <div className="flex items-center justify-between p-3 bg-black/50 border-b border-pink-500/30 relative">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400 font-bold text-sm font-mono tracking-wider animate-pulse">
          BREVKASSE.SYS
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-pink-500 mr-1 animate-pulse"></div>
          <div className="text-pink-500/70 text-xs font-mono">LIVE</div>
        </div>
      </div>
      
      {/* Terminal content med forbedret kontrast */}
      <div 
        ref={terminalRef}
        className="p-6 h-[450px] overflow-y-auto bg-gradient-to-b from-black/60 to-black/40 font-sans"
        style={{ 
          // Matrix baggrund
          backgroundImage: `linear-gradient(rgba(255, 0, 170, 0.03) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255, 0, 170, 0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        {/* History med forbedret visuel hierarki */}
        {terminalHistory.map((line, index) => (
          <div 
            key={index} 
            className={`mb-4 ${
              line.includes('Fejl') ? 'text-red-400 font-medium' : 
              (index === 0 && currentLine > 0) ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-400 font-bold text-2xl tracking-wider font-mono mb-2 uppercase' : 
              (index === 1 && currentLine > 1) ? 'text-white/80 text-sm mb-6' :
              line.includes('Indtast') || line.includes('Skriv') ? 'text-cyan-400 font-medium tracking-wide' :
              line.includes('sendt') || line.includes('uploadet') ? 'text-green-400 font-medium' :
              line.includes('Uploader') || line.includes('Sender') ? 'text-pink-400 font-medium' :
              'text-white/90'
            }`}
            style={{
              animation: 'fadeIn 0.5s ease forwards',
              opacity: 0,
              animationDelay: `${0.1 * index}s`,
              textShadow: index === 0 && currentLine > 0 ? '0 0 10px rgba(255,0,170,0.7)' : 'none'
            }}
          >
            {line}
          </div>
        ))}
        
        {/* Uploaded image preview med mere stilren ramme */}
        {uploadedImageUrl && (
          <div className="my-6 rounded-lg overflow-hidden bg-black/40 backdrop-blur-sm border border-pink-500/30 p-3 shadow-[0_0_15px_rgba(255,0,170,0.2)]">
            <div className="text-xs text-pink-400 mb-2 font-medium uppercase tracking-wider">Billede Preview:</div>
            <img 
              src={uploadedImageUrl} 
              alt="Uploaded" 
              className="max-w-full max-h-48 object-contain mx-auto rounded-md"
            />
          </div>
        )}
        
        {/* Input area med forbedret fokus-tilstand */}
        {!inputLocked && (
          <div className="mt-8">
            <div className="text-pink-400 text-sm mb-2 font-medium tracking-wide flex items-center">
              <div className="w-2 h-2 rounded-full bg-pink-500 mr-2 animate-pulse"></div>
              {currentField === 'name' ? 'DIT NAVN:' : 'DIN BESKED:'}
            </div>
            
            <form onSubmit={handleInputSubmit} className="flex flex-col gap-4">
              <div className="flex items-center bg-black/50 backdrop-blur-sm border border-pink-500/40 rounded-lg overflow-hidden focus-within:border-pink-500/70 focus-within:shadow-[0_0_15px_rgba(255,0,170,0.3)] transition duration-300">
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-transparent p-4 border-none outline-none text-white placeholder-pink-300/50 font-medium text-base"
                  disabled={inputLocked}
                  autoFocus
                  placeholder={currentField === 'name' ? 'Skriv dit navn her...' : 'Skriv din besked her...'}
                />
                <button type="submit" className="bg-gradient-to-r from-pink-600/50 to-purple-600/50 hover:from-pink-600/70 hover:to-purple-600/70 p-4 text-white transition duration-300 group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform duration-300">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
              
              {currentField === 'message' && (
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageSelection}
                    className="hidden" 
                    accept="image/*"
                  />
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-pink-500/40 hover:border-pink-500/70 text-pink-400 px-5 py-3 rounded-lg transition duration-300 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(255,0,170,0.2)]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {selectedImage ? 'Vælg et andet billede' : 'Tilføj et billede'}
                  </button>
                  
                  {selectedImage && (
                    <div className="text-sm text-pink-300/80 truncate flex-1 backdrop-blur-sm bg-black/20 p-2 rounded border border-pink-500/20">
                      {selectedImage.name}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        )}
        
        {/* Processing indicator med forbedret animation */}
        {sending && (
          <div className="mt-6 p-4 bg-black/50 backdrop-blur-sm border border-pink-500/40 rounded-lg flex items-center gap-3 shadow-[0_0_15px_rgba(255,0,170,0.2)]">
            <div className="animate-spin h-5 w-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full"></div>
            <div className="text-pink-400 font-medium tracking-wide">SENDER DIN BESKED...</div>
          </div>
        )}
      </div>
      
      {/* Footer med bedre visuel fremhævning */}
      <div className="bg-black/50 border-t border-pink-500/30 p-4 text-xs flex justify-between items-center">
        <div className="text-pink-300/60 font-medium">[STRIK_ENCRYPTED_CHANNEL]</div>
        <a href="/opslagstavle" className="text-pink-400 hover:text-white hover:bg-pink-500/30 transition-all duration-200 font-medium flex items-center gap-1 group rounded-full py-1 px-3 border border-transparent hover:border-pink-500/40">
          GÅ TIL OPSLAGSTAVLEN 
          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
        </a>
      </div>
      
      {/* Custom styles med flere animationer */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes neonPulse {
          0%, 100% { text-shadow: 0 0 5px rgba(255,0,170,0.5), 0 0 15px rgba(255,0,170,0.3); }
          50% { text-shadow: 0 0 10px rgba(255,0,170,0.8), 0 0 20px rgba(255,0,170,0.5); }
        }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
} 