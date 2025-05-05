'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase/client';
import DecorativeElement from '@/app/components/DecorativeElement';

// Udvidet Message type med likes
type Message = {
  id: string;
  created_at: string;
  navn: string;
  besked: string;
  billede: string | null;
  likes: number; // Tilføjet likes-felt
};

// Sorteringsfunktioner
enum SortType {
  NEWEST = 'nyeste',
  MOST_LIKED = 'mest_populære'
}

export default function OpslagstavlePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGlitchEffect, setShowGlitchEffect] = useState(true);
  const [sortType, setSortType] = useState<SortType>(SortType.NEWEST);
  const [likedMessages, setLikedMessages] = useState<{[key: string]: boolean}>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [corsStatus, setCorsStatus] = useState<string>('');
  
  // Format time ago for display
  const formatTimeAgo = (dateString: string) => {
    try {
      if (!dateString) return 'Ukendt tid';
      
      console.log('Formaterer tid:', dateString, 'Type:', typeof dateString);
      
      // Parse dato - støt forskellige formater
      let date: Date;
      if (typeof dateString === 'string') {
        // Forsøg at parse flere forskellige dato formater
        if (dateString.includes('T')) {
          // ISO format (2023-09-15T14:30:00Z)
          date = new Date(dateString);
        } else if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
          // Postgres timestamp uden timezone (2023-09-15 14:30:00)
          date = new Date(dateString.replace(' ', 'T') + 'Z');
        } else {
          // Prøv standard parsing
          date = new Date(dateString);
        }
      } else {
        // Fallback
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.error('Ugyldig dato:', dateString);
        return 'Ugyldig tid';
      }
      
      console.log('Parset dato:', date.toISOString());
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Lige nu';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minut' : 'minutter'} siden`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'time' : 'timer'} siden`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'dag' : 'dage'} siden`;
      } else {
        return new Intl.DateTimeFormat('da-DK', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }).format(date);
      }
    } catch (error) {
      console.error('Fejl ved formatering af tid:', error);
      return 'Fejl i tidsformat';
    }
  };

  // Sikker måde at hente timestamp fra en date string
  const safeGetTimestamp = (dateString: string): number => {
    try {
      if (!dateString) return 0;
      
      console.log('safeGetTimestamp for:', dateString, 'Type:', typeof dateString);
      
      // Parse dato - støt forskellige formater
      let date: Date;
      if (typeof dateString === 'string') {
        // Forsøg at parse flere forskellige dato formater
        if (dateString.includes('T')) {
          // ISO format (2023-09-15T14:30:00Z)
          date = new Date(dateString);
        } else if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
          // Postgres timestamp uden timezone (2023-09-15 14:30:00)
          date = new Date(dateString.replace(' ', 'T') + 'Z');
        } else {
          // Prøv standard parsing
          date = new Date(dateString);
        }
      } else {
        // Fallback
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.error('Ugyldig dato ved timestamp beregning:', dateString);
        return 0;
      }
      
      const timestamp = date.getTime();
      console.log('Beregnet timestamp:', timestamp);
      return timestamp;
    } catch (error) {
      console.error('Fejl ved parsing af dato:', dateString, error);
      return 0;
    }
  };

  // Sikker måde at konvertere en UUID til et numerisk tal
  const uuidToNumeric = (id: string): number => {
    try {
      if (!id) return 0;
      // Tag den første del af UUID'en eller hele strengen hvis der ikke er bindestreger
      const firstPart = id.split('-')[0] || id;
      // Konverter til et tal (UUID dele er typisk hex)
      return parseInt(firstPart, 16) || 0;
    } catch (error) {
      console.error('Fejl ved konvertering af ID:', id, error);
      return 0;
    }
  };

  // Sorter beskeder baseret på den valgte sorteringstype
  const sortMessages = (messages: Message[]): Message[] => {
    if (!messages || messages.length === 0) return [];
    
    // Forbered beskeder med konsistente likes-værdier
    const preparedMessages = messages.map(msg => ({
      ...msg,
      likes: extractLikesFromMessage(msg)
    }));
    
    // Log de første par beskeder for at se datoer
    if (preparedMessages.length > 0) {
      console.log('DATO DIAGNOSE (FØR SORTERING):');
      preparedMessages.slice(0, 3).forEach(msg => {
        console.log(`ID: ${msg.id.substring(0, 6)}, created_at: ${msg.created_at}, timestamp: ${safeGetTimestamp(msg.created_at)}`);
      });
    }
    
    const sortedMessages = [...preparedMessages];
    
    // Sorter efter den valgte sorteringstype
    if (sortType === SortType.NEWEST) {
      // Primært sorter efter created_at dato (nyeste først)
      return sortedMessages.sort((a, b) => {
        // Først prøv med dato
        const dateA = safeGetTimestamp(a.created_at);
        const dateB = safeGetTimestamp(b.created_at);
        
        if (dateA !== dateB) {
          return dateB - dateA; // Nyeste dato først
        }
        
        // Hvis datoerne er ens eller ugyldige, prøv med ID
        const idA = uuidToNumeric(a.id);
        const idB = uuidToNumeric(b.id);
        return idB - idA;
      });
    } else {
      // Sorter efter antal likes (højeste antal først)
      return sortedMessages.sort((a, b) => {
        const likesA = a.likes || 0;
        const likesB = b.likes || 0;
        
        if (likesA !== likesB) {
          return likesB - likesA; // Flest likes først
        }
        
        // Hvis likes er ens, sortér efter nyeste
        const dateA = safeGetTimestamp(a.created_at);
        const dateB = safeGetTimestamp(b.created_at);
        
        if (dateA !== dateB) {
          return dateB - dateA; // Nyeste dato først
        }
        
        // Hvis datoerne også er ens, sortér efter ID
        const idA = uuidToNumeric(a.id);
        const idB = uuidToNumeric(b.id);
        return idB - idA;
      });
    }
  };

  // Indlæs gemte likes fra localStorage ved opstart
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('likedMessages');
      if (savedLikes) {
        setLikedMessages(JSON.parse(savedLikes));
      }
    } catch (error) {
      console.error('Fejl ved indlæsning af gemte likes:', error);
    }
  }, []);

  // Håndter like/unlike af besked
  const handleLikeToggle = async (messageId: string) => {
    try {
      // Find beskeden i state
      const message = messages.find(msg => msg.id === messageId);
      if (!message) return;
      
      // Tjek om brugeren allerede har liket beskeden
      const isLiked = likedMessages[messageId];
      const newLikeCount = (message.likes || 0) + (isLiked ? -1 : 1);
      
      // Gem lokalt først (for hurtigere UI respons)
      const updatedLikes = { 
        ...likedMessages, 
        [messageId]: !isLiked 
      };
      
      // Opdater brugerens likede beskeder lokalt
      setLikedMessages(updatedLikes);
      
      // Opdater like count lokalt i UI
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, likes: newLikeCount } 
            : msg
        )
      );
      
      // Gem lokale likes i localStorage
      localStorage.setItem('likedMessages', JSON.stringify(updatedLikes));
      
      // Forsøg at opdatere likes i databasen hvis kolonnen eksisterer
      console.log(`Forsøger at opdatere likes for besked ${messageId} til ${newLikeCount}...`);
      
      // Alternativ tilgang: Brug metadata kolonnen hvis den findes
      // Eller opdater besked-kolonnen med likes-information i JSON-format
      try {
        // Først forsøger vi at opdatere en dedikeret likes-kolonne
        const { error: updateError } = await supabase
          .from('brevkasse_beskeder')
          .update({ likes: newLikeCount })
          .eq('id', messageId);
        
        if (updateError) {
          console.log('Kunne ikke opdatere likes direkte, prøver alternativ metode');
          
          // Hvis likes-kolonnen ikke findes, kan vi læse den eksisterende besked
          const { data: messageData, error: readError } = await supabase
            .from('brevkasse_beskeder')
            .select('besked')
            .eq('id', messageId)
            .single();
          
          if (readError) {
            throw new Error(`Kunne ikke læse besked: ${readError.message}`);
          }
          
          // Besked indhold
          let beskedContent = messageData.besked;
          
          // Tilføj likes-information i JSON-format i bunden af beskeden, hvis den ikke allerede findes
          // Format: "\n\n[LIKES:X]" hvor X er antal likes
          const likesRegex = /\n\n\[LIKES:(\d+)\]$/;
          const likesMatch = beskedContent.match(likesRegex);
          
          if (likesMatch) {
            // Opdater eksisterende likes-markering
            beskedContent = beskedContent.replace(likesRegex, `\n\n[LIKES:${newLikeCount}]`);
          } else {
            // Tilføj likes-markering
            beskedContent = `${beskedContent}\n\n[LIKES:${newLikeCount}]`;
          }
          
          // Opdater beskeden med likes-information
          const { error: updateBeskedError } = await supabase
            .from('brevkasse_beskeder')
            .update({ besked: beskedContent })
            .eq('id', messageId);
          
          if (updateBeskedError) {
            throw new Error(`Kunne ikke opdatere besked: ${updateBeskedError.message}`);
          }
          
          console.log('Besked opdateret med likes-information i teksten');
        } else {
          console.log('Likes opdateret i dedikeret kolonne');
        }
      } catch (dbError) {
        console.error('Database fejl ved likes opdatering:', dbError);
      }
    } catch (error) {
      console.error('Fejl ved like/unlike handling:', error);
      // Selv ved fejl beholder vi den lokale tilstand, så brugeroplevelsen forbliver god
    }
  };

  // Funktion til at ekstrahere likes fra besked-tekst
  const extractLikesFromMessage = (message: any): number => {
    try {
      if (message.likes !== undefined) {
        return message.likes;
      }
      
      // Tjek om beskedteksten indeholder likes-information
      const besked = message.besked || '';
      const likesMatch = besked.match(/\n\n\[LIKES:(\d+)\]$/);
      
      if (likesMatch && likesMatch[1]) {
        return parseInt(likesMatch[1], 10);
      }
      
      return 0;
    } catch (error) {
      console.error('Fejl ved udtrækning af likes:', error);
      return 0;
    }
  };

  useEffect(() => {
    // Fetch messages when component mounts
    const fetchMessages = async () => {
      try {
        setLoading(true);
        console.log('Henter beskeder fra Supabase...');
        
        // Forsøg at kontrollere forbindelsen
        console.log('Supabase forbindelse ok:', !!supabase);
        
        // Tjek først om likes-kolonnen eksisterer
        let likesColumnExists = false;
        try {
          console.log('Tjekker om likes-kolonnen eksisterer...');
          
          const { data: columnInfo, error: columnError } = await supabase
            .from('brevkasse_beskeder')
            .select('likes')
            .limit(1);
          
          if (columnError) {
            console.warn('Kunne ikke verificere likes-kolonne:', columnError.message);
            if (columnError.message.includes('column') && columnError.message.includes('likes')) {
              likesColumnExists = false;
              console.warn('Likes-kolonne findes ikke i databasen');
            }
          } else {
            likesColumnExists = true;
            console.log('Likes-kolonne findes i databasen');
          }
        } catch (e) {
          console.warn('Fejl ved tjek af likes-kolonne:', e);
        }
        
        // Hent alle beskeder
        const { data, error } = await supabase
          .from('brevkasse_beskeder')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Fejl ved hentning af beskeder:', {
            code: error.code || 'Ingen kode',
            message: error.message || 'Ingen besked',
            details: error.details || 'Ingen detaljer'
          });
          throw new Error(`Database fejl: ${error.message}`);
        }
        
        console.log('Hentede data:', data?.length || 0, 'beskeder');
        
        // Log rå data fra serveren for at tjekke dato-formater
        if (data && data.length > 0) {
          console.log('RAW DATA SAMPLE:');
          data.slice(0, 3).forEach((msg, i) => {
            console.log(`Besked ${i+1}:`, {
              id: msg.id,
              created_at: msg.created_at,
              created_at_type: typeof msg.created_at
            });
          });
        }
        
        // Forbered beskeder med likes information
        const messagesWithLikes = data?.map(msg => {
          const extractedLikes = likesColumnExists ? msg.likes : extractLikesFromMessage(msg);
          return {
            ...msg,
            likes: extractedLikes !== undefined ? extractedLikes : 0
          };
        }) || [];
        
        // Logging af likes-værdier
        if (messagesWithLikes.length > 0) {
          console.log('Likes sample:', messagesWithLikes.slice(0, 3).map(msg => ({
            id: msg.id,
            likes: msg.likes,
            hasLikesInText: msg.besked && msg.besked.includes('[LIKES:')
          })));
        }
        
        // Sorter beskeder efter den valgte sorteringstype
        const sortedMessages = sortMessages(messagesWithLikes);
        setMessages(sortedMessages);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ukendt fejl';
        setError('Fejl ved indlæsning af beskeder: ' + errorMessage);
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Fjern glitch effekt efter 3 sekunder
    const timer = setTimeout(() => {
      setShowGlitchEffect(false);
    }, 3000);

    // Set up real-time subscription for new messages and updates
    try {
      // Lyt til nye beskeder
      const insertSubscription = supabase
        .channel('brevkasse-inserts')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'brevkasse_beskeder'
        }, (payload: any) => {
          console.log('Ny besked modtaget via realtid:', payload);
          
          // Tilføj likes property hvis den ikke findes
          const newMessage = {
            ...payload.new,
            likes: payload.new.likes !== undefined ? payload.new.likes : 0
          };
          
          // Tilføj den nye besked og sorter
          setMessages(prevMessages => {
            const updatedMessages = [newMessage as Message, ...prevMessages];
            return sortMessages(updatedMessages);
          });
          
          // Kort glitch effekt ved ny besked
          setShowGlitchEffect(true);
          setTimeout(() => setShowGlitchEffect(false), 1500);
        })
        .subscribe();
      
      // Lyt til opdateringer (f.eks. like-ændringer)
      const updateSubscription = supabase
        .channel('brevkasse-updates')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'brevkasse_beskeder'
        }, (payload: any) => {
          console.log('Besked opdateret via realtid:', payload);
          
          // Opdater den ændrede besked i state
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg => 
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            );
            return sortMessages(updatedMessages);
          });
        })
        .subscribe();

      // Clean up subscriptions on unmount
      return () => {
        insertSubscription.unsubscribe();
        updateSubscription.unsubscribe();
        clearTimeout(timer);
      };
    } catch (error) {
      console.error('Fejl ved opsætning af realtid:', error);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [sortType]); // Genfetch og sorter når sorteringstypen ændres

  // Skift sorteringstype
  const toggleSortType = () => {
    setSortType(prevType => 
      prevType === SortType.NEWEST ? SortType.MOST_LIKED : SortType.NEWEST
    );
  };

  // Funktion til at teste et billede URL direkte
  const testImageUrl = async () => {
    try {
      // Test 1: Direkte ping til URL med fetch
      try {
        const response = await fetch(testUrl, { method: 'HEAD' });
        setCorsStatus(`Status: ${response.status}, OK: ${response.ok}, Type: ${response.headers.get('content-type')}`);
      } catch (err) {
        setCorsStatus(`Fetch fejl: ${err instanceof Error ? err.message : 'Ukendt fejl'}`);
      }
    } catch (error) {
      console.error('Fejl i test:', error);
    }
  };

  // CORS test funktion
  const testCors = async () => {
    try {
      setCorsStatus('Tester...');
      
      // Test for Supabase Storage URL
      if (testUrl.includes('supabase.co') && testUrl.includes('/storage/v1/')) {
        // Log de specifikke headers for en bedre forståelse
        try {
          const response = await fetch(testUrl, { method: 'HEAD' });
          let headerInfo = '';
          response.headers.forEach((value, key) => {
            headerInfo += `${key}: ${value}\n`;
          });
          setCorsStatus(`CORS Status: ${response.status}\nHeaders:\n${headerInfo}`);
        } catch (error) {
          setCorsStatus(`CORS Error: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        setCorsStatus('Ikke en Supabase URL');
      }
    } catch (error) {
      setCorsStatus(`Fejl: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Test for at generere en public URL fra storage bucket direkte
  const generateTestUrl = async () => {
    try {
      // Opret en test URL ved at bruge Supabase's offentlige URL-generator
      const { data } = supabase.storage
        .from('brevkasse-billeder')
        .getPublicUrl('p06g4u_0/test.jpg');
        
      if (data && data.publicUrl) {
        setTestUrl(data.publicUrl);
        console.log('Generated test URL:', data.publicUrl);
      } else {
        setTestUrl('Kunne ikke generere URL');
      }
    } catch (error) {
      console.error('URL generation error:', error);
      setTestUrl(`Fejl: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Tilføj useEffect til at styre fuldskærm-tilstand
  useEffect(() => {
    // Finder navbar elementet
    const navbar = document.querySelector('nav');
    
    if (navbar) {
      if (isFullscreen) {
        // Skjul navbar og tilføj margin-top 0 ved fuldskærm
        navbar.classList.add('hidden');
      } else {
        // Vis navbar igen når fuldskærm afsluttes
        navbar.classList.remove('hidden');
      }
    }
    
    // Tilføj overflow hidden til body når i fuldskærm
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup - sikrer at navbar vises igen når komponenten unmountes
      if (navbar) {
        navbar.classList.remove('hidden');
      }
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return (
    <div className={`min-h-screen flex flex-col items-center relative transition-all duration-500 ${isFullscreen ? 'fullscreen-mode fixed inset-0 z-50' : ''}`}>
      {/* Main Content med beskeder */}
      <div className={`w-full relative z-10 transition-all duration-500 ${isFullscreen ? 'h-screen pt-0 px-0 overflow-auto' : 'max-w-6xl px-4'}`}>
        {/* Hero sektion - kun vist når ikke i fuldskærm */}
        <div className={`transition-all duration-500 ${isFullscreen ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100 mb-16 text-center'}`}>
          <div className="mb-6">
            <Image 
              src="/OPSLAGSTAVLECHROME.png"
              alt="OPSLAGSTAVLE"
              width={700}
              height={180}
              className="mx-auto"
              priority
            />
          </div>
          <p className="text-white/80 mt-4 text-base sm:text-lg max-w-2xl mx-auto text-readable leading-relaxed backdrop-blur-sm py-3 px-6 bg-black/10 rounded-full inline-block">
            Her kan du se alle beskederne fra brevkassen - med kærlighed, sjove historier og spørgsmål
          </p>
        </div>
        
        {/* Kontrolpanel med sortering og fuldskærm - tilpasset stil baseret på fuldskærm tilstand */}
        <div className={`backdrop-blur-sm bg-black/20 border border-pink-500/20 transition-all duration-300 hover:bg-black/30 hover:border-pink-500/30 shadow-lg ${isFullscreen ? 'rounded-none p-3 fixed top-0 left-0 right-0 z-50' : 'rounded-2xl p-4 mb-10'}`}>
          <div className="flex justify-between items-center">
          {/* Sorteringsknap */}
          <button 
            onClick={toggleSortType}
              className="flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-4 py-2.5 rounded-xl border border-pink-500/30 transition-all duration-300 hover:border-pink-500/50"
          >
              {sortType === SortType.NEWEST ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              <span>Sortér: <span className="text-pink-300 font-medium">{sortType === SortType.NEWEST ? 'Nyeste' : 'Mest populære'}</span></span>
          </button>

          {/* Fuldskærm toggle */}
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2 bg-black/30 hover:bg-black/50 text-white px-4 py-2.5 rounded-xl border border-pink-500/30 transition-all duration-300 hover:border-pink-500/50"
          >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 5M4 4v7m11-7h7m0 0l-5 5m5-5v7m-7 11l5-5m0 0l-5-5m5 5H4m7 0h7m0 0l-5 5m5-5v-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
                <span>{isFullscreen ? 'Afslut' : 'Fuldskærm'}</span>
          </button>
          </div>
        </div>

        {/* Message grid - tilpasset med padding når i fuldskærm */}
        <div className={`grid gap-6 grid-cols-1 mx-auto transition-all duration-300 ${isFullscreen ? 'mt-16 px-4 pb-6 max-w-3xl w-full' : 'mb-16 max-w-3xl'}`}>
          {loading && (
            <div className={`backdrop-blur-sm bg-black/20 rounded-2xl flex justify-center items-center py-16 border border-pink-500/20 ${isFullscreen ? 'col-span-full' : ''}`}>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-t-2 border-l-2 border-pink-500 animate-spin mb-4"></div>
                <p className="text-pink-300 text-lg font-medium">Indlæser beskeder</p>
                <p className="text-white/50 text-sm">Etablerer forbindelse til brevkassen</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className={`backdrop-blur-sm bg-black/20 rounded-2xl p-8 my-8 border border-red-500/40 text-red-200 ${isFullscreen ? 'col-span-full' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="bg-red-500/20 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-400 font-bold text-xl mb-2">Der opstod en fejl</h3>
                  <p className="text-white/80 mb-4">{error}</p>
                  <p className="text-red-300/70 text-sm">Prøv at genindlæse siden eller tjek din forbindelse</p>
                </div>
              </div>
            </div>
          )}
          
          {!loading && messages.length === 0 && (
            <div className={`backdrop-blur-sm bg-black/20 rounded-2xl py-16 text-center border border-pink-500/20 ${isFullscreen ? 'col-span-full' : ''}`}>
              <div className="bg-pink-500/10 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-center text-pink-300 text-xl font-medium mb-2">
                Ingen beskeder endnu
              </p>
              <p className="text-white/60 mb-8">Vær den første til at skrive i brevkassen!</p>
              <Link href="/brevkasse" className="bg-gradient-to-r from-pink-600/40 to-purple-600/40 hover:from-pink-600/60 hover:to-purple-600/60 text-white px-6 py-3 rounded-xl border border-pink-500/30 transition-all duration-300 hover:border-pink-500/50 font-medium shadow-md inline-flex items-center gap-2">
                <span>Gå til Brevkasse</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
          
          {/* Beskeder - sorteret efter valgt kriterie */}
          {messages.map((msg, index) => {
            // Beregn om det er en kort eller lang besked - bestemmer styling
            const isShortMessage = !msg.billede && msg.besked && msg.besked.length < 100;
            
            return (
            <div 
              key={msg.id} 
                className={`backdrop-blur-sm bg-black/20 border border-pink-500/20 hover:border-pink-500/40 hover:bg-black/30 rounded-2xl transition-all duration-300 hover:shadow-lg ${isShortMessage ? 'py-3 px-4' : 'p-5'}`}
              >
                {/* Besked header - kompakt for korte beskeder */}
                <div className={`flex items-center justify-between ${isShortMessage ? 'mb-2' : 'mb-4'}`}>
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-700 flex items-center justify-center text-white font-bold text-base shadow-md">
                        {msg.navn.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* User info */}
                    <div>
                      <h3 className="text-white font-semibold text-sm tracking-wide">
                        {msg.navn}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-pink-300/70">{formatTimeAgo(msg.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges and Like button */}
                  <div className="flex items-center gap-2">
                    {sortType === SortType.NEWEST && index === 0 && (
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                        Nyeste
                      </div>
                    )}
                    {sortType === SortType.MOST_LIKED && index === 0 && msg.likes > 0 && (
                      <div className="bg-gradient-to-r from-pink-500 to-purple-400 text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                        Populær
                      </div>
                    )}
                    
                    {/* Like button */}
                    <button 
                      onClick={() => handleLikeToggle(msg.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 
                        ${likedMessages[msg.id] 
                          ? 'bg-gradient-to-r from-pink-500/40 to-pink-600/40 text-white border border-pink-500/50 shadow-md' 
                          : 'bg-black/30 text-white/70 hover:bg-black/40 border border-pink-500/20 hover:border-pink-500/40'
                        }`}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 ${likedMessages[msg.id] ? 'text-pink-300' : 'text-pink-400/70'}`}
                        fill={likedMessages[msg.id] ? "currentColor" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                      <span className={`text-xs font-medium ${likedMessages[msg.id] ? 'text-white' : 'text-white/80'}`}>
                        {msg.likes || 0}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Message content - enten inline eller blok baseret på længde */}
                {isShortMessage ? (
                  <div className="text-white font-medium text-base">
                    {msg.besked ? msg.besked.replace(/\n\n\[LIKES:\d+\]$/, '') : ''}
              </div>
                ) : (
                  <div className="my-3">
                    <div className="text-white font-medium whitespace-pre-wrap text-base leading-relaxed">
                  {msg.besked ? msg.besked.replace(/\n\n\[LIKES:\d+\]$/, '') : ''}
                </div>
              </div>
                )}

                {/* Image section - optimeret størrelse */}
              {msg.billede && (
                  <div className={`overflow-hidden rounded-lg border border-pink-500/20 ${isShortMessage ? 'mt-2' : 'mt-3'}`}>
                    <div className="relative w-full">
                  <div className="relative w-full">
                        {(() => {
                          try {
                            // Format URL correctly - handle both absolute and relative paths
                            let imageUrl = msg.billede;
                            
                            // Detaljeret logning af billede URL
                            console.log(`Forsøger at vise billede for ${msg.id}`);
                            console.log(`Original billede URL: "${imageUrl}"`);
                            
                            // Make sure we have valid URL format
                            if (!imageUrl) {
                              throw new Error('Manglende URL');
                            }
                            
                            // Sikre at relative URLs bliver konverteret til absolutte
                            if (imageUrl.startsWith('/uploads/')) {
                              const baseUrl = window.location.origin;
                              imageUrl = `${baseUrl}${imageUrl}`;
                              console.log(`Konverterede relativ URL til: ${imageUrl}`);
                            }

                            // Fjern eventuelle dobbeltkvoter fra URLen hvis de findes (sker nogle gange ved serialisering)
                            imageUrl = imageUrl.replace(/^"|"$/g, '');
                            
                            // Log for at se om vi får en Supabase URL
                            if (imageUrl.includes('supabase.co')) {
                              console.log('📸 Supabase Storage URL registreret:', imageUrl);
                            }
                            
                            // Vis et simpelt img-tag i stedet for Next.js Image component
                            // Dette omgår Next.js' Image optimering som kan give problemer med eksterne URLs
                            return (
                              <div className="w-full h-full flex items-center justify-center p-2 bg-black/40">
                                <img 
                                  src={imageUrl}
                        alt={`Billede fra ${msg.navn}`}
                                  className="w-full object-contain max-w-full max-h-[500px]"
                                  loading="lazy"
                                  onError={(e) => {
                                    console.error(`Billedet kunne ikke indlæses: ${imageUrl}`);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      // Indsæt fejlbesked med detaljeret fejlinformation
                                      const errorMsg = document.createElement('div');
                                      errorMsg.className = 'text-center py-6 text-pink-400';
                                      errorMsg.innerHTML = `
                                        Billedet kunne ikke indlæses<br>
                                        <span class="text-xs text-pink-300/70">URL: ${imageUrl.substring(0, 50)}...</span><br>
                                        <span class="text-xs text-pink-300/70">Prøv at genindlæse siden</span>
                                      `;
                                      parent.appendChild(errorMsg);
                                    }
                                  }}
                                />
                              </div>
                            );
                          } catch (error) {
                            console.error('Fejl ved håndtering af billedrendering:', error);
                            return (
                              <div className="flex items-center justify-center h-full py-6 bg-black/40">
                                <div className="text-pink-400 p-4 text-center">
                                  <p>Kunne ikke vise billedet</p>
                                  <p className="text-xs mt-2 text-pink-300/70">{error instanceof Error ? error.message : 'Ukendt fejl'}</p>
                                </div>
                              </div>
                            );
                          }
                        })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>

      {/* Footer - simplere og renere */}
      <div className={`transition-all duration-500 ${isFullscreen ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
        <div className="text-center text-xs text-pink-300/60 mt-6 mb-8">
          <p>© {new Date().getFullYear()} BAGGER & FELDTHAUS • STRIK & DRIK</p>
        </div>
      </div>
    </div>
  );
} 