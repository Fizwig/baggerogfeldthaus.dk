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
  const [currentField, setCurrentField] = useState<'name' | 'message'>('name');
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [inputLocked, setInputLocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [selectedImagePreview, setSelectedImagePreview] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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
    setTerminalHistory(prev => [...prev, `${currentField === 'name' ? '👤' : '💬'} ${input}`]);
    setInput(''); // Reset input field after submission
    
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
      
      // Log the image URL for debugging
      if (messageData.image_url) {
        console.log('Billede URL der gemmes:', messageData.image_url);
        console.log('Billede URL type:', typeof messageData.image_url);
        console.log('Billede URL længde:', messageData.image_url.length);
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
        console.error('Fejlkode:', error.code);
        console.error('Fejlbesked:', error.message);
        console.error('Fejldetaljer:', error.details);
        
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
      
      // Log det gemte billede URL for at verificere at det er korrekt
      if (data.billede) {
        console.log('Billede URL gemt i database:', data.billede);
      }
      
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
      console.log('📸 Starter upload af billede:', file.name, 'størrelse:', file.size, 'bytes', 'type:', file.type);
      
      if (!file || file.size === 0) {
        throw new Error('Ugyldig fil eller tom fil');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB maksimum
        throw new Error('Filen er for stor (maks 10MB)');
      }
      
      // Log accepterede filtyper
      const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!acceptedTypes.includes(file.type.toLowerCase())) {
        console.warn('⚠️ Ikke-standard filtype:', file.type);
      }
      
      // Brug FormData til upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Udførlig logging af upload-processen
      console.log('🚀 Sender billede til API endpoint...');
      
      // Vis upload status i terminalen
      setTerminalHistory(prev => [...prev, '📤 Uploader billede til server...']);
      
      const uploadStartTime = Date.now();
      const response = await fetch('/api/simpleupload', {
        method: 'POST',
        body: formData
      });
      
      const uploadTime = Date.now() - uploadStartTime;
      console.log(`⏱️ Upload tog ${uploadTime}ms, status:`, response.status);
      
      // Håndter fejl fra API
      if (!response.ok) {
        let errorMessage = `Server fejl (${response.status})`;
        try {
          const errorData = await response.json();
          console.error('❌ API fejl:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('❌ API fejltekst:', errorText || 'Ingen fejltekst');
        }
        
        setTerminalHistory(prev => [...prev, `❌ Upload fejl: ${errorMessage}`]);
        throw new Error(`Upload fejl: ${errorMessage}`);
      }
      
      // Parse API svar
      let result;
      try {
        result = await response.json();
        console.log('📩 Upload API svar:', result);
      } catch (parseError) {
        console.error('❌ Fejl ved parsing af API svar:', parseError);
        throw new Error('Kunne ikke forstå serverens svar');
      }
      
      // Kontroller resultat
      if (!result.url) {
        console.error('❌ Ingen URL i API svar:', result);
        throw new Error('Ingen billede-URL returneret fra serveren');
      }
      
      // Success!
      const imageUrl = result.url;
      console.log('✅ Billede uploadet, URL:', imageUrl);
      setTerminalHistory(prev => [...prev, '✅ Billede uploadet!']);
      
      // Log URL detaljer for fejlsøgning
      console.log('🔍 URL type:', typeof imageUrl);
      console.log('🔍 URL længde:', imageUrl.length);
      console.log('🔍 URL start:', imageUrl.substring(0, 30));
      console.log('🔍 URL slut:', imageUrl.substring(imageUrl.length - 30));
      
      // Test URL tilgængelighed ved at lave et HEAD request
      try {
        const testFetch = await fetch(imageUrl, { method: 'HEAD' });
        console.log('🧪 URL test resultat:', testFetch.status, testFetch.ok);
      } catch (testError) {
        console.warn('⚠️ URL test fejl (ignoreret):', testError);
      }
      
      // Returner den offentlige URL
      return imageUrl;
    } catch (error) {
      console.error('❌ Fejl ved upload af billede:', error);
      setTerminalHistory(prev => [...prev, `❌ ${error instanceof Error ? error.message : 'Ukendt fejl ved upload'}`]);
      throw error;
    }
  };
  
  // Håndter valg af billede
  const handleSelectImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Håndter ændring af fil i fil-input
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Opret billede preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // Log valgt billede
      console.log(`Billede valgt: ${file.name}, type: ${file.type}, størrelse: ${file.size} bytes`);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
      {/* Terminal header med futuristisk design */}
      <div className="bg-gradient-to-r from-black/90 to-pink-900/60 backdrop-blur-lg px-5 py-4 flex items-center border-b border-pink-500/30">
        <div className="flex space-x-2">
          <div className="w-3.5 h-3.5 bg-red-500 rounded-full shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all"></div>
          <div className="w-3.5 h-3.5 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all"></div>
          <div className="w-3.5 h-3.5 bg-green-500 rounded-full shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all"></div>
        </div>
        <div className="mx-auto flex items-center space-x-3">
          <div className="flex space-x-1">
            {[1, 2, 3].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 bg-pink-500 rounded-full"
                style={{ 
                  animation: `pulse 1.5s infinite ${i * 0.3}s`, 
                  opacity: 0.7 + (i * 0.1)
                }}
              ></div>
            ))}
          </div>
          <p className="text-white font-semibold tracking-wider text-center relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-pink-500">BREVKASSEN</span>
            <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent"></span>
          </p>
          <div className="flex space-x-1">
            {[1, 2, 3].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 bg-pink-500 rounded-full"
                style={{ 
                  animation: `pulse 1.5s infinite ${i * 0.3}s`, 
                  opacity: 0.7 + (i * 0.1)
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Terminal body med futuristisk design */}
      <div className="bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-xl p-6 sm:p-8 relative">
        {/* Dekorative elementer */}
        <div className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-pink-500/30 to-transparent"></div>
        
        {/* Terminal output med forbedret styling */}
        <div 
          ref={terminalRef}
          className="mb-6 h-[360px] sm:h-[420px] overflow-y-auto custom-scrollbar pr-2"
        >
          <div className="font-mono text-base sm:text-lg leading-relaxed text-white/90">
            {terminalHistory.map((line, index) => (
              <div 
                key={index} 
                className={`mb-3 ${
                  line.includes('✨') ? 'text-pink-400 font-semibold' :
                  line.includes('❌') ? 'text-red-400' :
                  line.includes('💭') ? 'text-blue-300' :
                  line.includes('👤') ? 'text-purple-300' :
                  line.includes('📸') || line.includes('📤') ? 'text-yellow-300' :
                  line.includes('✅') ? 'text-green-400' :
                  'text-green-300'
                }`}
                style={{ 
                  animation: `fadeIn 0.5s ease-out forwards`,
                  animationDelay: `${index * 0.15}s`
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Terminal input med forbedret styling og interaktivitet */}
        <div className="relative">
          {/* Fjerner instruktionsboksen helt */}
          
          {/* Input felt med send-knap */}
          <div className="bg-gradient-to-r from-black/70 to-black/80 border border-pink-500/40 rounded-lg p-1.5 overflow-hidden shadow-lg shadow-pink-500/5">
            <div className="flex items-center">
              <div className="text-pink-500 text-xl mx-3 font-bold animate-pulse">⟩</div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !inputLocked && !sending && handleInputSubmit(e)}
                disabled={inputLocked || sending}
                className="w-full bg-transparent text-base sm:text-lg text-white py-3 focus:outline-none placeholder-white/30"
                placeholder={
                  currentField === 'name' 
                    ? 'Skriv dit navn her...' 
                    : 'Skriv din besked her...'
                }
                autoFocus
              />
              
              {/* Send-knap */}
              <button
                onClick={handleInputSubmit}
                disabled={inputLocked || sending || !input.trim()}
                className={`mx-3 px-5 py-2 rounded-md text-white font-bold text-sm sm:text-base transition-all duration-300 ${
                  inputLocked || sending || !input.trim() 
                    ? 'bg-pink-800/50 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 hover:shadow-md hover:shadow-pink-500/20 hover:scale-105'
                }`}
              >
                {sending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sender
                  </span>
                ) : (
                  'SEND'
                )}
              </button>
            </div>
            
            {/* Filupload og thumbnail - kun vist når beskeden skal skrives */}
            {currentField === 'message' && (
              <div className="mt-3 px-4 pb-3 flex items-center">
                <button
                  onClick={handleSelectImage}
                  className={`flex items-center px-4 py-2 ${
                    selectedImage 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500' 
                      : 'bg-gradient-to-r from-indigo-700 to-indigo-600'
                  } hover:from-indigo-600 hover:to-indigo-500 rounded-md text-white font-medium transition-all hover:shadow-md hover:shadow-indigo-500/20`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selectedImage ? 'Skift billede' : 'Tilføj billede'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {selectedImage && (
                  <div className="flex ml-3 items-center animate-fade-in">
                    <div className="relative w-12 h-12 border border-pink-500/50 rounded-md overflow-hidden shadow-md">
                      <img 
                        src={selectedImagePreview} 
                        alt="Valgt billede" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedImagePreview('');
                      }}
                      className="ml-2 text-red-400 hover:text-red-300 hover:scale-110 transition-transform"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobilvenlig hjælpetekst */}
        <div className="mt-6 text-center relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent"></div>
          <p className="text-xs sm:text-sm text-white/50 pt-4">
            Dine beskeder vises på <a href="/opslagstavle" className="text-pink-400 hover:text-pink-300 transition-colors hover:underline">opslagstavlen</a> og kan indgå i STRIK & DRIK showet
          </p>
        </div>
      </div>
      
      {/* Custom styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.7);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .animate-blink {
          animation: blink 0.8s step-end infinite;
        }
      `}</style>
    </div>
  );
} 