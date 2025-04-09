'use client';

import { useState, useEffect, useRef } from 'react';
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

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 relative transition-all duration-500 ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Nyt dynamisk baggrunds design */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Base layer - Deep space effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/30 to-black"></div>
        
        {/* Dynamic nebula effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-purple-500/10 to-blue-500/5 animate-nebula"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 via-pink-500/5 to-blue-500/5 animate-nebula-reverse"></div>
        </div>

        {/* Floating orbs */}
        <div className="absolute inset-0">
          {/* Large orb */}
          <div className="absolute right-[10%] top-[20%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent blur-3xl animate-float-slow"></div>
          {/* Medium orb */}
          <div className="absolute left-[15%] top-[40%] w-[25vw] h-[25vw] rounded-full bg-gradient-to-tr from-pink-500/10 via-purple-500/5 to-transparent blur-2xl animate-float-medium"></div>
          {/* Small orb */}
          <div className="absolute right-[25%] bottom-[20%] w-[15vw] h-[15vw] rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent blur-xl animate-float-fast"></div>
        </div>

        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_39px,rgba(219,39,119,0.05)_40px),linear-gradient(transparent_39px,rgba(219,39,119,0.05)_40px)] bg-[size:40px_40px] animate-grid-scroll opacity-20"></div>
        
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49%,rgba(219,39,119,0.05)_50%,transparent_51%)] bg-[size:100%_4px]"></div>
        
        {/* Dynamic light rays */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(219,39,119,0.1)_90deg,transparent_180deg)] animate-ray-rotate"></div>
          <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,transparent_0deg,rgba(147,51,234,0.1)_90deg,transparent_180deg)] animate-ray-rotate-reverse"></div>
        </div>
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay"></div>
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,0.7)_100%)]"></div>
        
        {/* Glowing edges */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent"></div>
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-pink-500/20 to-transparent"></div>
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-pink-500/20 to-transparent"></div>
        </div>
      </div>

      {/* Navigation og Header - skjules i fuldskærm */}
      <div className={`w-full transition-all duration-500 ${isFullscreen ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
        {/* Existing navigation and header */}
        <nav className="mt-10 mb-8">
          <ul className="flex flex-wrap justify-center gap-3">
            <li>
              <Link 
                href="/" 
                className="relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
              >
                <span className="relative z-10">Forside</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/turne" 
                className="relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
              >
                <span className="relative z-10">Turné</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/brevkasse" 
                className="relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
              >
                <span className="relative z-10">Brevkasse</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/opslagstavle" 
                className="relative px-6 py-2 group backdrop-blur-md bg-pink-600/20 border border-pink-400/50 rounded-md inline-block text-white font-medium"
              >
                <span className="relative z-10">Opslagstavle</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-400 animate-pulse"></span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="w-full max-w-6xl mx-auto p-4 relative z-10">
          {/* ... existing header ... */}
        </div>
      </div>

      {/* Main Content med beskeder */}
      <div className={`w-full relative z-10 transition-all duration-500 ${isFullscreen ? 'pt-0 px-4' : 'max-w-6xl p-4'}`}>
        {/* Kontrolpanel med sortering og fuldskærm */}
        <div className="flex justify-between items-center mb-6 backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl p-3">
          {/* Sorteringsknap */}
          <button 
            onClick={toggleSortType}
            className="relative px-4 py-2 backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
          >
            <span className="flex items-center gap-2">
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
            </span>
          </button>

          {/* Fuldskærm toggle */}
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="relative px-4 py-2 backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
          >
            <span className="flex items-center gap-2">
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 5M4 4v7m11-7h7m0 0l-5 5m5-5v7m-7 11l5-5m0 0l-5-5m5 5H4m7 0h7m0 0l-5 5m5-5v-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
              <span>{isFullscreen ? 'Afslut fuldskærm' : 'Fuldskærm'}</span>
            </span>
          </button>
        </div>

        {/* Messages grid - justeret layout i fuldskærm */}
        <div className={`grid gap-8 mb-16 ${isFullscreen ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1'}`}>
          {loading && (
            <div className="flex justify-center items-center py-12 backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl">
              <div className="cyber-spinner"></div>
              <div className="ml-4">
                <p className="text-pink-300 animate-pulse">Indlæser beskeder...</p>
                <p className="text-xs text-white/50">Etablerer forbindelse</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/30 backdrop-blur-md border border-red-500/50 text-red-200 p-6 rounded-lg my-6 relative overflow-hidden">
              <h3 className="text-red-400 font-bold mb-2">FEJL</h3>
              {error}
              <p className="mt-3 text-xs text-red-300/70">Prøv at genindlæse siden eller tjek din forbindelse</p>
            </div>
          )}
          
          {!loading && messages.length === 0 && (
            <div className="text-center py-16 backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl">
              <p className="text-center text-pink-300 mt-6 text-xl">
                Ingen beskeder endnu.
              </p>
              <p className="text-white/60 mt-2">Vær den første til at skrive i brevkassen!</p>
              <Link href="/brevkasse" className="inline-block mt-6 relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md text-white font-medium">
                Gå til Brevkasse →
              </Link>
            </div>
          )}
          
          {/* Beskeder - sorteret efter valgt kriterie */}
          {messages.map((msg, index) => (
            <div 
              key={msg.id} 
              className={`group/card backdrop-blur-md bg-black/40 rounded-xl overflow-hidden transition-all duration-500 
                ${isFullscreen 
                  ? 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(219,39,119,0.2)]' 
                  : 'hover:shadow-[0_0_25px_rgba(219,39,119,0.15)]'
                }`}
            >
              {/* Besked header */}
              <div className="p-5 border-b border-pink-500/10 bg-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {msg.navn.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-700 opacity-30 blur-md -z-10"></div>
                    </div>
                    
                    {/* User info */}
                    <div>
                      <h3 className="text-white font-semibold text-lg tracking-wide leading-none mb-1">
                        {msg.navn}
                      </h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-pink-300/70">{formatTimeAgo(msg.created_at)}</span>
                        <span className="text-pink-500/50">•</span>
                        <span className="font-mono text-xs text-pink-300/50">#{msg.id.substring(0, 6)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {sortType === SortType.NEWEST && index === 0 && (
                      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                        Nyeste
                      </div>
                    )}
                    {sortType === SortType.MOST_LIKED && index === 0 && msg.likes > 0 && (
                      <div className="bg-gradient-to-r from-pink-500 to-purple-400 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                        Mest populær
                      </div>
                    )}
                    
                    {/* Like button */}
                    <button 
                      onClick={() => handleLikeToggle(msg.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 
                        ${likedMessages[msg.id] 
                          ? 'bg-pink-500/30 text-pink-300 shadow-[0_0_15px_rgba(219,39,119,0.3)]' 
                          : 'bg-black/20 text-white/70 hover:bg-white/10'
                        }`}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 transition-transform duration-300 ${likedMessages[msg.id] ? 'scale-110 animate-pulse' : ''}`}
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
                      <span className={`text-sm font-medium transition-all duration-300 ${msg.likes > 0 ? (likedMessages[msg.id] ? 'text-pink-200' : 'text-pink-300/70') : ''}`}>
                        {msg.likes || 0}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Message content */}
              <div className="p-6">
                <div className="text-white/90 whitespace-pre-wrap text-base leading-relaxed">
                  {msg.besked ? msg.besked.replace(/\n\n\[LIKES:\d+\]$/, '') : ''}
                </div>
              </div>

              {/* Image section */}
              {msg.billede && (
                <div className="relative w-full bg-black/30">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none z-10"></div>
                  <div className="relative w-full">
                    <div className="relative aspect-video w-full group/img">
                      {/* Error boundary for images that might fail to load */}
                      {(() => {
                        try {
                          // Format URL correctly - handle both absolute and relative paths
                          const imageUrl = msg.billede.startsWith('/')
                            ? msg.billede // Local URL - keep as is
                            : msg.billede; // Supabase URL - already absolute
                            
                          console.log(`Rendering image for ${msg.id}: ${imageUrl}`);
                          
                          return (
                            <>
                              <Image 
                                src={imageUrl}
                                alt={`Billede fra ${msg.navn}`}
                                fill
                                className="object-contain transition-transform duration-700 group-hover/img:scale-[1.02]"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                onError={(e) => {
                                  console.error(`Image failed to load: ${imageUrl}`);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const errorMsg = document.createElement('div');
                                    errorMsg.className = 'text-center py-6 text-pink-400';
                                    errorMsg.textContent = 'Billedet kunne ikke indlæses';
                                    parent.appendChild(errorMsg);
                                  }
                                }}
                              />
                              <div className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-pink-500/5 via-transparent to-pink-500/5"></div>
                            </>
                          );
                        } catch (error) {
                          console.error('Error rendering image:', error);
                          return (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-pink-400 p-4 text-center">
                                <p>Kunne ikke vise billedet</p>
                                <p className="text-xs mt-2 text-pink-300/70">{String(error).substring(0, 50)}</p>
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
          ))}
        </div>
      </div>

      {/* Footer - skjules i fuldskærm */}
      <div className={`transition-all duration-500 ${isFullscreen ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
        <div className="text-center text-xs text-pink-300/60 mt-6">
          <p>© {new Date().getFullYear()} BAGGER & FELDTHAUS • STRIK & DRIK • Danmark</p>
        </div>
      </div>
    </div>
  );
} 